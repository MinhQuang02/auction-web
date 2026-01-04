import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";

const ALLOWED_FIELDS = [
  "full_name",
  "address",
  "dob",
  // "is_email_verified",
  "seller_expires",
];

const adminUserController = {
  getAllUsers: async (req, res) => {
    try {
      const {
        page = 0,
        limit = 10,
        keyword,
        role,
        sort_by,
        upgrade_requested,
      } = req.query;

      const take = Number(limit);
      const skip = Number(page) * take;

      const where = {};

      if (keyword) {
        where.OR = [
          { full_name: { contains: keyword, mode: "insensitive" } },
          { email: { contains: keyword, mode: "insensitive" } },
        ];
      }

      if (role && role !== "all") {
        where.role = role;
      }

      if (upgrade_requested === "true") {
        where.upgrade_request_time = { not: null };
      }

      let orderBy = { created_at: "desc" };
      if (sort_by === "created_at_asc") orderBy = { created_at: "asc" };
      if (sort_by === "rating_desc") orderBy = { avg_rating: "desc" };
      if (sort_by === "rating_asc") orderBy = { avg_rating: "asc" };

      const [items, total] = await Promise.all([
        prisma.user.findMany({
          where,
          orderBy,
          skip,
          take,
          select: {
            user_id: true,
            full_name: true,
            email: true,
            role: true,
            avg_rating: true,
            created_at: true,
            upgrade_request_time: true,
            upgrade_reason: true,
            seller_expires: true,
          },
        }),
        prisma.user.count({ where }),
      ]);

      res.status(200).json({ items, total });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  getUserDetail: async (req, res) => {
    const userId = Number(req.params.id);

    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { user_id: userId },
        select: {
          user_id: true,
          full_name: true,
          dob: true,
          email: true,
          address: true,
          role: true,
          created_at: true,
          upgrade_request_time: true,
          upgrade_reason: true,
          seller_expires: true,
        },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const products = await prisma.product.findMany({
        where: {
          OR: [{ seller_id: userId }, { winner_id: userId }],
        },
        orderBy: { end_time: "desc" },
        take: 20,
        select: {
          product_id: true,
          name: true,
          status: true,
          current_price: true,
          end_time: true,
          seller_id: true,
          winner_id: true,
        },
      });

      const bidHistory = await prisma.bid_History.findMany({
        where: { bidder_id: userId },
        orderBy: { bid_time: "desc" },
        take: 20,
        select: {
          max_bid_amount: true,
          bid_time: true,
          product: {
            select: {
              product_id: true,
              name: true,
              status: true,
            },
          },
        },
      });

      const activityHistory = bidHistory.map((b) => ({
        event_type: "Bid",
        date: b.bid_time,
        details: `Bid $${b.max_bid_amount} on "${b.product.name}" (${b.product.status})`,
      }));

      const [
        totalBids,
        auctionsWon,
        auctionsHeld,
        ratingsReceived,
        ratingsGiven,
        avgRating,
      ] = await Promise.all([
        prisma.bid_History.count({
          where: { bidder_id: userId },
        }),

        prisma.product.count({
          where: { winner_id: userId },
        }),

        prisma.product.count({
          where: { seller_id: userId },
        }),

        prisma.rating.count({
          where: { rated_user_id: userId },
        }),

        prisma.rating.count({
          where: { rater_id: userId },
        }),

        prisma.rating.aggregate({
          where: { rated_user_id: userId },
          _avg: { rating_value: true },
        }),
      ]);

      res.status(200).json({
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        address: user.address,
        dob: user.dob,
        role: user.role,
        join_date: user.created_at,
        upgrade_request_time: user.upgrade_request_time,
        upgrade_reason: user.upgrade_reason,
        seller_expires: user.seller_expires,

        total_bids: totalBids,
        auctions_won: auctionsWon,
        auctions_held: auctionsHeld,

        rating: avgRating._avg.rating_value ?? 0,
        ratings_received: ratingsReceived,
        ratings_given: ratingsGiven,

        products,
        activity_history: activityHistory,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  getUserStats: async (req, res) => {
    try {
      const [totalUsers, pendingUpgrades] = await Promise.all([
        prisma.user.count(),

        prisma.user.count({
          where: {
            upgrade_request_time: { not: null },
          },
        }),
      ]);

      res.status(200).json({
        totalUsers,
        pendingUpgrades,
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  downgradeSeller: async (req, res) => {
    const { userId } = req.body;
    const sellerId = Number(userId);

    if (!sellerId || Number.isNaN(sellerId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
      await prisma.$transaction(async (tx) => {
        // 1. Verify user exists and is a seller
        const user = await tx.user.findUnique({
          where: { user_id: sellerId },
          select: { role: true },
        });

        if (!user) {
          throw new Error("User not found");
        }

        if (user.role !== "seller") {
          throw new Error("User is not a seller");
        }

        // 2. Remove ALL active products by this seller
        await tx.product.updateMany({
          where: {
            seller_id: sellerId,
            status: "active",
          },
          data: {
            status: "removed",
          },
        });

        // 3. Downgrade seller → bidder
        await tx.user.update({
          where: { user_id: sellerId },
          data: {
            role: "bidder",
            seller_expires: null,
            upgrade_request_time: null,
          },
        });
      });

      res.status(200).json({ message: "Seller downgraded successfully" });
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: err.message });
    }
  },

  suspendUser: async (req, res) => {
    const { userId } = req.body;
    const targetId = Number(userId);

    if (!targetId || Number.isNaN(targetId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
          where: { user_id: targetId },
          select: { role: true },
        });

        if (!user) throw new Error("User not found");
        if (user.role === "admin") {
          throw new Error("Cannot suspend admin");
        }

        await tx.product.updateMany({
          where: {
            seller_id: targetId,
            status: "active",
          },
          data: {
            status: "removed",
          },
        });

        await tx.user.update({
          where: { user_id: targetId },
          data: {
            role: "suspended",
            seller_expires: null,
            upgrade_request_time: null,
          },
        });
      });

      res.status(200).json({ message: "User suspended successfully" });
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: err.message });
    }
  },

  updateUserProfile: async (req, res) => {
    const userId = Number(req.params.id);
    if (!userId) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const data = {};
    for (const field of ALLOWED_FIELDS) {
      if (field in req.body) {
        data[field] = req.body[field];
      }
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: "No editable fields provided" });
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { user_id: userId },
        data,
        select: {
          user_id: true,
          full_name: true,
          email: true,
          role: true,
          is_email_verified: true,
          seller_expires: true,
        },
      });

      res.json(updatedUser);
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: "Update failed" });
    }
  },

  unsuspendUser: async (req, res) => {
    const { userId } = req.body;
    const targetId = Number(userId);

    if (!targetId || Number.isNaN(targetId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
      const user = await prisma.user.findUnique({
        where: { user_id: targetId },
        select: { role: true },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.role !== "suspended") {
        return res.status(400).json({ message: "User is not suspended" });
      }

      await prisma.user.update({
        where: { user_id: targetId },
        data: {
          role: "bidder",
        },
      });

      res.status(200).json({ message: "User unsuspended successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  createUser: async (req, res) => {
    const { email, password, full_name, address, dob } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          full_name,
          address,
          dob: dob ? new Date(dob) : null,
          role: "bidder",
          is_email_verified: true,
        },
        select: {
          user_id: true,
        },
      });

      res.status(201).json(user);
    } catch (err) {
      if (err.code === "P2002") {
        return res.status(400).json({ message: "Email already exists" });
      }

      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

export default adminUserController;

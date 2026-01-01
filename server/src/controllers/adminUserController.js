import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const adminUserController = {
  getAllUsers: async (req, res) => {
    try {
      const {
        page = 0,
        limit = 10,
        keyword,
        role,
        status,
        sort_by,
      } = req.query;

      const take = Number(limit);
      const skip = Number(page) * take;

      const where = {};

      // SEARCH
      if (keyword) {
        where.OR = [
          { full_name: { contains: keyword, mode: "insensitive" } },
          { email: { contains: keyword, mode: "insensitive" } },
        ];
      }

      // ROLE FILTER
      if (role) {
        where.role = role;
      }

      // STATUS FILTER
      const now = new Date();
      if (status === "upgrade") {
        where.upgrade_request_time = { not: null };
      }
      if (status === "seller_active") {
        where.role = "seller";
        where.seller_expires = { gt: now };
      }
      if (status === "seller_expired") {
        where.role = "seller";
        where.seller_expires = { lte: now };
      }

      // SORT
      let orderBy = { created_at: "desc" };
      if (sort_by === "created_at_asc") orderBy = { created_at: "asc" };
      if (sort_by === "rating_desc") orderBy = { avg_rating: "desc" };
      if (sort_by === "rating_asc") orderBy = { avg_rating: "asc" };

      const users = await prisma.user.findMany({
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
          seller_expires: true,
        },
      });

      res.status(200).json(users);
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
          email: true,
          address: true,
          role: true,
          created_at: true,
          upgrade_request_time: true,
          seller_expires: true,
        },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

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
        role: user.role,
        join_date: user.created_at,
        upgrade_request_time: user.upgrade_request_time,
        seller_expires: user.seller_expires,

        total_bids: totalBids,
        auctions_won: auctionsWon,
        auctions_held: auctionsHeld,

        rating: avgRating._avg.rating_value ?? 0,
        ratings_received: ratingsReceived,
        ratings_given: ratingsGiven,

        activity_history: [],
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

export default adminUserController;

import prisma from "../lib/prisma.js";

const upgradeController = {
  requestUpgrade: async (req, res) => {
    try {
      const userId = parseInt(req.auth.userId);

      const user = await prisma.user.findUnique({ where: { user_id: userId } });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await prisma.user.update({
        where: { user_id: userId },
        data: {
          upgrade_request_time: new Date(),
          upgrade_reason: req.body.reason,
        },
      });

      return res
        .status(200)
        .json({ message: "Upgrade request sent successfully" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Internal server error: " + error.message });
    }
  },

  getRequests: async (req, res) => {
    try {
      const requests = await prisma.user.findMany({
        where: {
          upgrade_request_time: { not: null },
          role: "bidder",
        },
        select: {
          user_id: true,
          full_name: true,
          email: true,
          role: true,
          upgrade_request_time: true,
          created_at: true,
        },
      });

      res.status(200).json(requests);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  approveUpgrade: async (req, res) => {
    try {
      const userId = parseInt(req.body.userId);

      const user = await prisma.user.findUnique({
        where: { user_id: userId },
      });

      if (!user || user.role !== "bidder") {
        return res.status(400).json({ message: "Invalid upgrade request" });
      }

      const sellerExpires = new Date();
      sellerExpires.setDate(sellerExpires.getDate() + 7);

      await prisma.user.update({
        where: { user_id: userId },
        data: {
          role: "seller",
          upgrade_request_time: null,
          upgrade_reason: null,
          seller_expires: sellerExpires,
        },
      });

      res.status(200).json({ message: "User promoted to seller" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },

  rejectUpgrade: async (req, res) => {
    try {
      const userId = parseInt(req.body.userId);

      const user = await prisma.user.findUnique({
        where: { user_id: userId },
      });

      if (!user || !user.upgrade_request_time) {
        return res.status(400).json({ message: "Invalid upgrade request" });
      }

      await prisma.user.update({
        where: { user_id: userId },
        data: { upgrade_request_time: null, upgrade_reason: null },
      });

      res.status(200).json({ message: "Upgrade request rejected" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  },
};

export default upgradeController;

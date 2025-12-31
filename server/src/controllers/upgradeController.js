import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const upgradeController = {
  requestUpgrade: async (req, res) => {

    try {
      // 1. Verify User ID from Auth Middleware
      if (!req.auth || !req.auth.userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Ensure ID is an Integer (Prisma requires Int for ID)
      const userId = parseInt(req.auth.userId);

      // 2. Check if user exists (Optional safety check)
      const user = await prisma.user.findUnique({ where: { user_id: userId } });
      if (!user) {
         return res.status(404).json({ message: "User not found" });
      }

      // 3. Update Database
      await prisma.user.update({
        where: { user_id: userId },
        data: {
          upgrade_request_time: new Date(),
        },
      });

      return res.status(200).json({ message: "Upgrade request sent successfully" });

    } catch (error) {
      return res.status(500).json({ message: "Internal server error: " + error.message });
    }
  },

  getRequests: async (req, res) => {
    try {
        const requests = await prisma.user.findMany({
            where: {
                upgrade_request_time: { not: null },
                role: 'bidder'
            },
            select: {
                user_id: true,
                full_name: true,
                email: true,
                role: true,
                upgrade_request_time: true,
            }
        });
        res.status(200).json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
  },

  approveUpgrade: async (req, res) => {
    try {
        const { userId } = req.body;

        await prisma.user.update({
            where: { user_id: parseInt(userId) },
            data: {
                role: 'seller',
                upgrade_request_time: null
            }
        });

        res.status(200).json({ message: 'User promoted to Seller successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
  },

  rejectUpgrade: async (req, res) => {
    try {
        const { userId } = req.body;

        await prisma.user.update({
            where: { user_id: parseInt(userId) },
            data: {
                upgrade_request_time: null
            }
        });

        res.status(200).json({ message: 'Upgrade request rejected' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
  }
};

export default upgradeController;
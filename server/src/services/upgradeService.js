import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const createUpgradeRequest = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { user_id: userId }
    });

    if (!user) {
        throw new Error('User not found');
    }

    if (user.role !== 'bidder') {
        throw new Error('Only bidders can request upgrade');
    }

    const existingRequest = await prisma.upgradeRequest.findUnique({
        where: { user_id: userId }
    });

    if (existingRequest) {
        throw new Error('Upgrade request already sent');
    }

    const request = await prisma.upgradeRequest.create({
        data: {
            user_id: userId
        }
    });

    return request;
};

const getPendingRequests = async () => {
    const requests = await prisma.upgradeRequest.findMany({
        orderBy: {
            created_at: 'desc'
        }
    });
    return requests;
};

export default {
    createUpgradeRequest,
    getPendingRequests
};

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const getWatchlistByUserId = async (userId) => {
    const watchlist = await prisma.watchlist.findMany({
        where: {
            user_id: parseInt(userId),
        },
    });
    return watchlist;
};

const removeWatchlist = async (userId, productId) => {
    return await prisma.watchlist.delete({
        where: {
            user_id_product_id: {
                user_id: parseInt(userId),
                product_id: parseInt(productId),
            },
        },
    });
};

export default {
    getWatchlistByUserId,
    removeWatchlist,
};

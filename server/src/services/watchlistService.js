import prisma from '../lib/prisma.js';

const getWatchlistByUserId = async (userId) => {
    const watchlist = await prisma.watchlist.findMany({
        where: {
            user_id: parseInt(userId),
        },
        include: {
            product: {
                include: {
                    images: { take: 1 }, // Include images for display
                    category: true, // Include category name if needed
                    // Add Bids to get Highest Bidder
                    bids: {
                        take: 1,
                        orderBy: { max_bid_amount: 'desc' },
                        include: {
                            bidder: { select: { full_name: true } }
                        }
                    },
                    // Add Seller for completeness if needed (though requirement focused on Bidder Identity)
                    seller: { select: { full_name: true } }
                }
            }
        }
    });
    return watchlist;
};

const addToWatchlist = async (userId, productId) => {
    // Check if checks are needed, Prisma throws error on duplicate due to @@id
    return await prisma.watchlist.create({
        data: {
            user_id: parseInt(userId),
            product_id: parseInt(productId)
        }
    });
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
    addToWatchlist,
    removeWatchlist,
};

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 1. SEARCH & FILTER
const searchProducts = async ({ keyword, categoryId, sortBy, limit = 10, offset = 0 }) => {
    const where = {
        status: 'active',
    };

    // Filter by Category
    if (categoryId) {
        where.category_id = parseInt(categoryId);
    }

    // Full-Text Search (Req 1.4)
    if (keyword) {
        // Using Prisma's fullTextSearch feature (Postgres)
        where.OR = [
            { name: { contains: keyword, mode: 'insensitive' } }, 
            { description: { contains: keyword, mode: 'insensitive' } }
        ];
        // Note: If you enabled "fullTextSearch" in schema, you can also use:
        // { name: { search: keyword } }
    }

    // Sorting (Req 1.4)
    let orderBy = {};
    if (sortBy === 'time_desc') {
        orderBy = { end_time: 'desc' }; // Ending soonest? Actually usually 'asc' for "ending soon", 'desc' for "ended last"
        // Requirement says "Time ending decreasing" (Thời gian kết thúc giảm dần) -> usually means furthest away first? 
        // Or "Ending Soonest" (time remaining increasing). 
        // Let's assume standard auction sort:
        // 'time_asc' = Ending Soonest (Closest date first)
        // 'time_desc' = Ending Latest
    } else if (sortBy === 'price_asc') {
        orderBy = { current_price: 'asc' };
    } else {
        // Default: Newest products first? Or ending soonest?
        orderBy = { start_time: 'desc' };
    }

    const products = await prisma.product.findMany({
        where,
        orderBy,
        take: parseInt(limit),
        skip: parseInt(offset),
        include: {
            // Include extra info for the card view
            images: { take: 1 }, 
            bids: { 
                orderBy: { max_bid_amount: 'desc' },
                take: 1 // To show who is winning
            }
        }
    });

    return products;
};

// 2. PRODUCT DETAILS (Req 1.5)
const getProductById = async (productId) => {
    const product = await prisma.product.findUnique({
        where: { product_id: parseInt(productId) },
        include: {
            images: true,
            seller: {
                select: { full_name: true, avg_rating: true, total_ratings: true }
            },
            category: true,
            bids: {
                orderBy: { bid_time: 'desc' },
                include: {
                    bidder: {
                        select: { full_name: true, avg_rating: true }
                    }
                }
            }
        }
    });

    if (!product) return null;

    // Mask Bidder Names (Req 2.3)
    // "Tran Minh Khoa" -> "****Khoa"
    const maskedBids = product.bids.map(bid => {
        const parts = bid.bidder.full_name.trim().split(' ');
        const lastName = parts[parts.length - 1];
        return {
            ...bid,
            bidder: {
                ...bid.bidder,
                full_name: `****${lastName}` // Masking logic
            }
        };
    });

    return { ...product, bids: maskedBids };
};

// 3. RELATED PRODUCTS
const getRelatedProducts = async (productId, categoryId) => {
    return await prisma.product.findMany({
        where: {
            category_id: categoryId,
            product_id: { not: parseInt(productId) }, // Exclude current
            status: 'active'
        },
        take: 5,
        orderBy: { end_time: 'asc' }, // Ending soonest related items
        include: { images: { take: 1 } }
    });
};

export default {
    searchProducts,
    getProductById,
    getRelatedProducts
};
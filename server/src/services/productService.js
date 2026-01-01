import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const ALLOWED_STATUS = ["active", "sold", "ended_no_winner", "removed"];

// 1. SEARCH & FILTER
const searchProducts = async ({
  keyword,
  categoryId,
  sortBy,
  limit = 10,
  offset = 0,
  status,
}) => {
  if (status && !ALLOWED_STATUS.includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }

  const where = {};

  if (status) {
    where.status = status;
  }

  // Filter by Category
  if (categoryId) {
    where.category_id = parseInt(categoryId);
  }

  // Full-Text Search
  if (keyword) {
    where.OR = [
      { name: { contains: keyword, mode: "insensitive" } },
      { description: { contains: keyword, mode: "insensitive" } },
    ];
  }

  // Sorting
  let orderBy = {};
  if (sortBy === "time_desc") {
    orderBy = { end_time: "desc" };
  } else if (sortBy === "price_asc") {
    orderBy = { current_price: "asc" };
  } else {
    orderBy = { start_time: "desc" };
  }

  const products = await prisma.product.findMany({
    where,
    orderBy,
    take: parseInt(limit),
    skip: parseInt(offset),
    include: {
      images: { take: 1 },
      bids: {
        orderBy: { max_bid_amount: "desc" },
        take: 1,
      },
      seller: {
        select: {
          full_name: true,
        },
      },
      category: {
        select: {
          name: true,
        },
      },
    },
  });

  return products;
};

// 2. PRODUCT DETAILS
const getProductById = async (productId) => {
    const idInt = parseInt(productId);
    
    if (isNaN(idInt)) {
        return null;
    }

    const product = await prisma.product.findUnique({
        where: { product_id: idInt },
        include: {
            images: true,
            seller: {
                select: { full_name: true, avg_rating: true, total_ratings: true },
            },
            category: true,
            bids: {
                orderBy: { bid_time: "desc" },
                include: {
                    bidder: {
                        select: { full_name: true, avg_rating: true },
                    },
                },
            },
        },
    });

    if (!product) return null;

    // Mask Bidder Names
    const maskedBids = product.bids.map(bid => {
        // Safety check if bidder is missing
        if (!bid.bidder || !bid.bidder.full_name) {
            return { ...bid, bidder: { full_name: "****User" } };
        }
        
        const parts = bid.bidder.full_name.trim().split(' ');
        const lastName = parts[parts.length - 1];
        return {
            ...bid,
            bidder: {
                ...bid.bidder,
                full_name: `****${lastName}`
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
      status: "active",
    },
    take: 5,
    orderBy: { end_time: "asc" }, // Ending soonest related items
    include: { images: { take: 1 } },
  });
};

// 4. GET SELLER PRODUCTS (Your logic)
const getProductsBySellerId = async (sellerId) => {
    return await prisma.product.findMany({
        where: { seller_id: parseInt(sellerId) },
        orderBy: { start_time: 'desc' },
        include: {
            images: { take: 1 },
            bids: { 
                orderBy: { max_bid_amount: 'desc' },
                take: 1
            }
        }
    });
};

// --- TEAM'S NEW LOGIC (Preserved) ---
const createProduct = async (data) => {
  const {
    name,
    description,
    category_id,
    seller_id,
    start_time,
    end_time,
    start_price,
    buy_now_price,
  } = data;

  if (!name || !category_id || !seller_id || !start_time || !end_time) {
    throw new Error("Missing required fields");
  }

  return await prisma.product.create({
    data: {
      name,
      description,
      category_id: parseInt(category_id),
      seller_id: parseInt(seller_id),
      start_time: new Date(start_time),
      end_time: new Date(end_time),
      start_price,
      buy_now_price,
      status: "active",
    },
  });
};

const updateProduct = async (productId, data) => {
  const existing = await prisma.product.findUnique({
    where: { product_id: parseInt(productId) },
  });

  if (!existing) {
    throw new Error("Product not found");
  }

  return await prisma.product.update({
    where: { product_id: parseInt(productId) },
    data,
  });
};

const deleteProduct = async (productId) => {
  const id = parseInt(productId);

  const bidCount = await prisma.bid_History.count({
    where: { product_id: id },
  });

  if (bidCount > 0) {
    throw new Error("Cannot delete product with existing bids");
  }

  // Soft delete
  await prisma.product.update({
    where: { product_id: id },
    data: { status: "removed" },
  });
};

export default {
    searchProducts,
    getProductById,
    getRelatedProducts,
    getProductsBySellerId,
    createProduct,
    updateProduct,
    deleteProduct,
};
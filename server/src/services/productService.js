import { PrismaClient } from "@prisma/client";
import ratingService from "./ratingService.js";
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
            bids: { orderBy: { max_bid_amount: 'desc' }, take: 1 },
            // ✅ NEW: Fetch winner details to show in "Sold" tab
            winner: {
                select: { user_id: true, full_name: true }
            },
            // ✅ NEW: Fetch ratings to see if I already rated them
            ratings: {
                where: { rater_id: parseInt(sellerId) }
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

// TASK 3.3: REJECT BIDDER (Updated for your Schema)
const rejectBidder = async (sellerId, productId, bidderId) => {
    const pId = parseInt(productId);
    const bId = parseInt(bidderId);

    // 1. Verify Ownership
    const product = await prisma.product.findUnique({
        where: { product_id: pId }
    });

    if (!product) throw new Error("Product not found");
    if (product.seller_id !== sellerId) throw new Error("Unauthorized");

    // 2. Ban the User (Using your Banned_Bidder model)
    await prisma.banned_Bidder.upsert({
        where: {
            product_id_bidder_id: { 
                product_id: pId,
                bidder_id: bId
            }
        },
        create: { product_id: pId, bidder_id: bId },
        update: {} 
    });

    // 3. RECALCULATE WINNER
    const bannedRecords = await prisma.banned_Bidder.findMany({
        where: { product_id: pId },
        select: { bidder_id: true }
    });
    const bannedIds = bannedRecords.map(b => b.bidder_id);

    const validBids = await prisma.bid_History.findMany({
        where: {
            product_id: pId,
            bidder_id: { notIn: bannedIds } 
        },
        orderBy: { max_bid_amount: 'desc' }
    });

    let newCurrentPrice = product.start_price;
    let newWinnerId = null;
    let newBidderId = null;

    if (validBids.length > 0) {
        // Highest valid bid
        newCurrentPrice = validBids[0].max_bid_amount;
        newWinnerId = null; 
        newBidderId = validBids[0].bidder_id;
    }

    // Update Product
    await prisma.product.update({
        where: { product_id: pId },
        data: { 
            current_price: newCurrentPrice,
            current_bidder_id: newBidderId 
        }
    });

    return { message: "Bidder rejected and price updated", newPrice: newCurrentPrice };
};

// TASK 3.4: ADD QUESTION (Updated for Product_Question)
const addQuestion = async (userId, productId, content) => {
    return await prisma.product_Question.create({
        data: {
            asker_id: userId,          
            product_id: parseInt(productId),
            question_text: content,    
        }
    });
};

// TASK 3.4: ANSWER QUESTION
const answerQuestion = async (sellerId, questionId, answer) => {
    const qId = parseInt(questionId);

    // Verify ownership via Product relation
    const question = await prisma.product_Question.findUnique({
        where: { question_id: qId },
        include: { product: true }
    });

    if (!question) throw new Error("Question not found");
    if (question.product.seller_id !== sellerId) throw new Error("Unauthorized");

    return await prisma.product_Question.update({
        where: { question_id: qId },
        data: { 
            answer_text: answer,       
            answer_time: new Date()   
        }
    });
};

// TASK 3.4: GET QUESTIONS
const getProductQuestions = async (productId) => {
    return await prisma.product_Question.findMany({
        where: { product_id: parseInt(productId) },
        include: { 
            asker: { select: { full_name: true } } 
        },
        orderBy: { question_time: 'desc' } 
    });
};


// NEW: Cancel Transaction (Task 3.5)
const cancelTransaction = async (sellerId, productId) => {
    const pId = parseInt(productId);

    // 1. Get Product & Winner
    const product = await prisma.product.findUnique({
        where: { product_id: pId }
    });

    if (!product) throw new Error("Product not found");
    if (product.seller_id !== sellerId) throw new Error("Unauthorized");
    if (!product.winner_id) throw new Error("No winner to cancel");

    // 2. Auto-Rate the Winner (-1)
    try {
        await ratingService.addRating({
            rater_id: sellerId,
            rated_user_id: product.winner_id,
            product_id: pId,
            rating_value: -1,
            comment: "Winner did not pay" // 
        });
    } catch (e) {
        console.log("Auto-rating skipped:", e.message);
    }
    
    return await prisma.product.update({
        where: { product_id: pId },
        data: {
            status: 'ended_no_winner', 
        }
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
    rejectBidder,
    addQuestion,
    answerQuestion,
    getProductQuestions,
    // New
    cancelTransaction
};
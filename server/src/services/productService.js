import prisma from "../lib/prisma.js";
import ratingService from "./ratingService.js";
import categoryService from "./categoryService.js";

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
    const categoryIds = await categoryService.getCategoryAndDescendants(
      categoryId
    );
    where.category_id = { in: categoryIds };
  }

  // Full-Text Search
  if (keyword) {
    const formattedQuery = keyword.trim().replace(/\s+/g, " & ");
    where.OR = [
      { name: { search: formattedQuery } },
      { description: { search: formattedQuery } },
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

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      orderBy,
      take: parseInt(limit),
      skip: parseInt(offset),
      include: {
        images: { take: 1 },
        bids: {
          orderBy: { max_bid_amount: "desc" },
          take: 1,
          include: { bidder: { select: { full_name: true } } },
        },
        seller: { select: { full_name: true } },
        category: { select: { name: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  // Masking Logic Applied to List
  const productsWithMasking = products.map((p) => {
    let maskedSellerName = "***";
    if (p.seller?.full_name) {
      maskedSellerName = "***" + p.seller.full_name.trim().slice(-3);
    }

    let maskedBidder = null;
    if (p.bids && p.bids.length > 0) {
      const firstBid = { ...p.bids[0] };
      if (firstBid.bidder?.full_name) {
        firstBid.bidder = {
          ...firstBid.bidder,
          full_name: "***" + firstBid.bidder.full_name.trim().slice(-3),
        };
      } else {
        if (firstBid.bidder) firstBid.bidder.full_name = "***";
      }
      maskedBidder = [firstBid];
    } else {
      maskedBidder = [];
    }

    return {
      ...p,
      seller: { ...p.seller, full_name: maskedSellerName },
      bids: maskedBidder,
    };
  });

  return { products: productsWithMasking, total };
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
      transaction: true, 
    },
  });

  if (!product) return null;

  const maskedBids = product.bids.map((bid) => {
    if (!bid.bidder || !bid.bidder.full_name) {
      return { ...bid, bidder: { ...bid.bidder, full_name: "***" } };
    }

    const fullName = bid.bidder.full_name.trim();
    const maskedName = `***${fullName.slice(-3)}`;

    return {
      ...bid,
      bidder: {
        ...bid.bidder,
        full_name: maskedName,
      },
    };
  });

  let paymentStatus = "Unpaid";
  if (product.transaction) {
    if (product.transaction.status === "completed") paymentStatus = "Paid";
    else if (product.transaction.status === "pending_shipping")
      paymentStatus = "Paid";
    else if (product.transaction.status === "shipped") paymentStatus = "Paid";
    else if (product.transaction.status === "cancelled")
      paymentStatus = "Cancelled";
  }

  return { ...product, bids: maskedBids, paymentStatus };
};

// 3. RELATED PRODUCTS
const getRelatedProducts = async (productId, categoryId) => {
  return await prisma.product.findMany({
    where: {
      category_id: categoryId,
      product_id: { not: parseInt(productId) }, 
      status: "active",
    },
    take: 5,
    orderBy: { end_time: "asc" }, 
    include: { images: { take: 1 } },
  });
};

const getReplacementProduct = async (excludeIds = [], categoryId = null) => {
  const excluded = excludeIds
    .map((id) => parseInt(id))
    .filter((id) => !isNaN(id));

  const where = {
    status: "active",
    end_time: { gt: new Date() },
    product_id: { notIn: excluded },
  };

  if (categoryId) {
    where.category_id = parseInt(categoryId);
  }

  const count = await prisma.product.count({ where });
  if (count === 0) return null;

  const skip = Math.floor(Math.random() * count);

  const products = await prisma.product.findMany({
    where,
    take: 1,
    skip: skip,
    include: {
      images: { take: 1 },
      seller: { select: { full_name: true } },
      bids: { take: 1, orderBy: { max_bid_amount: "desc" } },
    },
  });

  if (products.length === 0) return null;

  const p = products[0];
  let maskedSellerName = "***";
  if (p.seller?.full_name) {
    maskedSellerName = "***" + p.seller.full_name.trim().slice(-3);
  }

  return {
    ...p,
    seller: { ...p.seller, full_name: maskedSellerName },
  };
};

// 4. GET SELLER PRODUCTS
const getProductsBySellerId = async (sellerId) => {
  return await prisma.product.findMany({
    where: { seller_id: parseInt(sellerId) },
    orderBy: { start_time: "desc" },
    include: {
      images: { take: 1 },
      bids: { orderBy: { max_bid_amount: "desc" }, take: 1 },
      winner: {
        select: { user_id: true, full_name: true },
      },
      ratings: {
        where: { rater_id: parseInt(sellerId) },
      },
    },
  });
};

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

  await prisma.product.update({
    where: { product_id: id },
    data: { status: "removed" },
  });
};

// TASK 3.3: REJECT BIDDER
const rejectBidder = async (sellerId, productId, bidderId) => {
  const pId = parseInt(productId);
  const bId = parseInt(bidderId);

  const product = await prisma.product.findUnique({
    where: { product_id: pId },
  });

  if (!product) throw new Error("Product not found");
  if (product.seller_id !== sellerId) throw new Error("Unauthorized");

  await prisma.banned_Bidder.upsert({
    where: {
      product_id_bidder_id: {
        product_id: pId,
        bidder_id: bId,
      },
    },
    create: { product_id: pId, bidder_id: bId },
    update: {},
  });

  await prisma.bid_History.updateMany({
      where: { product_id: pId, bidder_id: bId },
      data: { status: 'rejected' } 
  });

  const bannedRecords = await prisma.banned_Bidder.findMany({
    where: { product_id: pId },
    select: { bidder_id: true },
  });
  const bannedIds = bannedRecords.map((b) => b.bidder_id);

  const validBids = await prisma.bid_History.findMany({
    where: {
      product_id: pId,
      bidder_id: { notIn: bannedIds }, // Exclude banned users
    },
    orderBy: { max_bid_amount: "desc" },
  });

  let newCurrentPrice = product.start_price;
  let newCurrentBidderId = null;

  if (validBids.length > 0) {
    // The new price is the highest valid bid
    newCurrentPrice = validBids[0].max_bid_amount;
    newCurrentBidderId = validBids[0].bidder_id;
  }

  // Update the product with the new "Clean" state
  await prisma.product.update({
    where: { product_id: pId },
    data: {
      current_price: newCurrentPrice,
      current_bidder_id: newCurrentBidderId,
    },
  });

  return {
    message: "Bidder rejected. Winner recalculated.",
    newPrice: newCurrentPrice,
  };
};

// TASK 3.4: ADD QUESTION
const addQuestion = async (userId, productId, content) => {
  return await prisma.product_Question.create({
    data: {
      asker_id: userId,
      product_id: parseInt(productId),
      question_text: content,
    },
  });
};

// TASK 3.4: ANSWER QUESTION
const answerQuestion = async (sellerId, questionId, answer) => {
  const qId = parseInt(questionId);

  const question = await prisma.product_Question.findUnique({
    where: { question_id: qId },
    include: { product: true },
  });

  if (!question) throw new Error("Question not found");
  if (question.product.seller_id !== sellerId) throw new Error("Unauthorized");

  return await prisma.product_Question.update({
    where: { question_id: qId },
    data: {
      answer_text: answer,
      answer_time: new Date(),
    },
  });
};

// TASK 3.4: GET QUESTIONS
const getProductQuestions = async (productId) => {
  return await prisma.product_Question.findMany({
    where: { product_id: parseInt(productId) },
    include: {
      asker: { select: { full_name: true } },
    },
    orderBy: { question_time: "desc" },
  });
};

const getUserPurchases = async (userId) => {
  const products = await prisma.product.findMany({
    where: {
      winner_id: parseInt(userId),
    },
    include: {
      images: { take: 1 },
      seller: { select: { full_name: true } },
      transaction: true, 
    },
    orderBy: { end_time: "desc" },
  });

  return products.map((p) => {
    let paymentStatus = "Unpaid";
    if (p.transaction) {
      if (p.transaction.status === "completed") paymentStatus = "Paid";
      else if (p.transaction.status === "pending_shipping")
        paymentStatus = "Paid";
      else if (p.transaction.status === "shipped") paymentStatus = "Paid";
      else if (p.transaction.status === "cancelled")
        paymentStatus = "Cancelled";
    }

    return {
      ...p,
      paymentStatus, 
      canPay: !p.transaction || p.transaction.status === "pending_payment",
    };
  });
};

const getUserActiveBids = async (userId) => {
  const products = await prisma.product.findMany({
    where: {
      status: "active",
      end_time: { gt: new Date() },
      bids: {
        some: {
          bidder_id: parseInt(userId),
        },
      },
    },
    include: {
      images: { take: 1 },
      current_bidder: { select: { full_name: true } },
      bids: {
        where: { bidder_id: parseInt(userId) },
        orderBy: { max_bid_amount: "desc" },
        take: 1,
      },
    },
    orderBy: { end_time: "asc" },
  });

  return products.map((p) => ({
    ...p,
    my_bid: p.bids[0]?.max_bid_amount || 0,
    is_winning: p.current_bidder_id === parseInt(userId),
  }));
};

// Cancel Transaction (Task 3.5)
const cancelTransaction = async (sellerId, productId) => {
  const pId = parseInt(productId);

  const product = await prisma.product.findUnique({
    where: { product_id: pId },
    include: { transaction: true }, 
  });

  if (!product) throw new Error("Product not found");
  if (product.seller_id !== sellerId) throw new Error("Unauthorized");
  if (!product.winner_id) throw new Error("No winner to cancel");

  try {
    await ratingService.addRating({
      rater_id: sellerId,
      rated_user_id: product.winner_id,
      product_id: pId,
      rating_value: -1,
      comment: "Winner did not pay",
    });
  } catch (e) {
    console.log("Auto-rating skipped:", e.message);
  }

  if (product.transaction) {
    await prisma.transaction.update({
      where: { transaction_id: product.transaction.transaction_id },
      data: { status: "cancelled" },
    });
  }

  return await prisma.product.update({
    where: { product_id: pId },
    data: {
      status: "ended_no_winner",
    },
  });
};

const getFeaturedProducts = async (limit = 10) => {
  return await prisma.product.findMany({
    where: {
      status: "active",
      end_time: { gt: new Date() },
    },
    take: parseInt(limit),
    orderBy: { bid_count: "desc" },
    include: {
      images: { take: 1 },
      category: { include: { parent: true } },
      bids: { take: 1, orderBy: { max_bid_amount: "desc" } },
      seller: { select: { full_name: true } },
    },
  });
};

const getOngoingProducts = async (limit = 10) => {
  return await prisma.product.findMany({
    where: {
      status: "active",
      end_time: { gt: new Date() },
    },
    take: parseInt(limit),
    orderBy: { end_time: "asc" }, 
    include: {
      images: { take: 1 },
      current_bidder: { select: { full_name: true } },
    },
  });
};

const getCompetitiveProducts = async (limit = 10) => {
  return await prisma.product.findMany({
    where: {
      status: "active",
      end_time: { gt: new Date() },
    },
    take: parseInt(limit),
    orderBy: { current_price: "desc" }, 
    include: {
      images: { take: 1 },
      bids: { take: 1, orderBy: { max_bid_amount: "desc" } },
      seller: { select: { full_name: true } },
    },
  });
};

const createTransaction = async (userId, productId, shippingData) => {
  const pId = parseInt(productId);
  const uId = parseInt(userId);

  const product = await prisma.product.findUnique({
    where: { product_id: pId },
    include: { transaction: true },
  });

  if (!product) throw new Error("Product not found");
  if (product.winner_id !== uId)
    throw new Error("You are not the winner of this item");
  if (product.transaction) throw new Error("Transaction already exists");

  const transaction = await prisma.transaction.create({
    data: {
      product_id: pId,
      buyer_id: uId,
      seller_id: product.seller_id,
      status: "pending_shipping", 
      shipping_address: JSON.stringify(shippingData),
      payment_proof: "Online Payment (Simulated)",
    },
  });

  return transaction;
};

const getAuctionStats = async () => {
  const now = new Date();
  const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const [activeCount, endingSoonCount] = await Promise.all([
    prisma.product.count({
      where: {
        status: "active",
        end_time: { gt: now },
      },
    }),
    prisma.product.count({
      where: {
        status: "active",
        end_time: {
          gt: now,
          lte: next24h,
        },
      },
    }),
  ]);

  return {
    active: activeCount,
    endingSoon24h: endingSoonCount,
  };
};

const placeBid = async (userId, productId, amount) => {
    const pId = parseInt(productId);
    const bidAmount = parseFloat(amount);

    const isBanned = await prisma.banned_Bidder.findUnique({
        where: {
            product_id_bidder_id: {
                product_id: pId,
                bidder_id: userId
            }
        }
    });

    if (isBanned) {
        throw new Error("You have been banned from this auction by the seller.");
    }

    const product = await prisma.product.findUnique({
        where: { product_id: pId },
        include: { bids: { orderBy: { max_bid_amount: 'desc' }, take: 1 } }
    });

    if (!product) throw new Error("Product not found");
    if (product.seller_id === userId) throw new Error("You cannot bid on your own product");

    const highestBid = product.bids[0]?.max_bid_amount || product.start_price;
    const minBid = parseFloat(highestBid) + parseFloat(product.step_price);
    const effectiveMin = product.bids.length === 0 ? parseFloat(product.start_price) : minBid;

    if (bidAmount < effectiveMin) {
        throw new Error(`Bid too low. Minimum required is $${effectiveMin.toLocaleString()}`);
    }

    const newBid = await prisma.bid_History.create({
        data: {
            product_id: pId,
            bidder_id: userId,
            max_bid_amount: bidAmount,
            bid_time: new Date()
        }
    });

    await prisma.product.update({
        where: { product_id: pId },
        data: {
            current_price: bidAmount,
            bid_count: { increment: 1 },
            current_bidder_id: userId,
            ...(product.auto_extend_enabled && (new Date(product.end_time) - new Date() < 5 * 60 * 1000)
                ? { end_time: new Date(new Date(product.end_time).getTime() + 10 * 60 * 1000) } 
                : {})
        }
    });

    return newBid;
};

export default {
  searchProducts,
  getProductById,
  getRelatedProducts,
  getReplacementProduct,
  getProductsBySellerId,
  createProduct,
  updateProduct,
  deleteProduct,
  rejectBidder,
  addQuestion,
  answerQuestion,
  getProductQuestions,
  cancelTransaction,
  getFeaturedProducts,
  getOngoingProducts,
  getCompetitiveProducts,
  getUserPurchases,
  getUserActiveBids,
  createTransaction,
  getAuctionStats,
  placeBid,
};

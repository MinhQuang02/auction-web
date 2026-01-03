import prisma from "../lib/prisma.js";
import ratingService from "./ratingService.js";
import categoryService from "./categoryService.js";

const ALLOWED_STATUS = ["active", "sold", "ended_no_winner", "removed"];

// ==============================================================================
// HELPER: Mask Usernames (Privacy)
// ==============================================================================
const maskProducts = (products) => {
  return products.map((p) => {
    // Mask Seller
    let maskedSeller = p.seller;
    if (p.seller?.full_name) {
      maskedSeller = {
        ...p.seller,
        full_name: "***" + p.seller.full_name.trim().slice(-3),
      };
    }

    // Mask Bids
    const maskedBids = (p.bids || []).map((bid) => {
      let maskedBidder = bid.bidder;
      if (bid.bidder?.full_name) {
        maskedBidder = {
          ...bid.bidder,
          full_name: "***" + bid.bidder.full_name.trim().slice(-3),
        };
      } else if (bid.bidder) {
        maskedBidder = { ...bid.bidder, full_name: "***" };
      }
      return { ...bid, bidder: maskedBidder };
    });

    // Mask Current Bidder
    let maskedCurrentBidder = p.current_bidder;
    if (p.current_bidder?.full_name) {
      maskedCurrentBidder = {
        ...p.current_bidder,
        full_name: "***" + p.current_bidder.full_name.trim().slice(-3),
      };
    } else if (p.current_bidder) {
      maskedCurrentBidder = { ...p.current_bidder, full_name: "***" };
    }

    return {
      ...p,
      seller: maskedSeller,
      bids: maskedBids,
      current_bidder: maskedCurrentBidder,
    };
  });
};

// ==============================================================================
// 1. SEARCH & FILTER
// ==============================================================================
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

  if (categoryId) {
    const categoryIds = await categoryService.getCategoryAndDescendants(
      categoryId
    );
    where.category_id = { in: categoryIds };
  }

  if (keyword) {
    const formattedQuery = keyword.trim().replace(/\s+/g, " & ");
    where.OR = [
      { name: { search: formattedQuery } },
      { description: { search: formattedQuery } },
    ];
  }

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

  return { products: maskProducts(products), total };
};

// ==============================================================================
// 2. PRODUCT DETAILS
// ==============================================================================
const getProductById = async (productId) => {
  const idInt = parseInt(productId);
  if (isNaN(idInt)) return null;

  const product = await prisma.product.findUnique({
    where: { product_id: idInt },
    include: {
      images: true,
      seller: {
        select: { full_name: true, avg_rating: true, total_ratings: true },
      },
      category: true,
      bids: {
        orderBy: { max_bid_amount: "desc" },
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

  const bannedRecords = await prisma.banned_Bidder.findMany({
      where: { product_id: idInt },
      select: { bidder_id: true }
  });
  const bannedSet = new Set(bannedRecords.map(b => b.bidder_id));

  const maskedBids = product.bids.map((bid) => {
    const isBanned = bannedSet.has(bid.bidder_id);
    const status = isBanned ? 'rejected' : 'valid';

    let maskedName = "***";
    if (bid.bidder && bid.bidder.full_name) {
        const fullName = bid.bidder.full_name.trim();
        maskedName = `***${fullName.slice(-3)}`;
    }

    return {
      ...bid,
      status, 
      bidder: {
        ...bid.bidder,
        full_name: maskedName,
      },
    };
  });

  const maskedProduct = maskProducts([product])[0];

  let paymentStatus = "Unpaid";
  if (product.transaction) {
    if (['completed', 'pending_shipping', 'shipped'].includes(product.transaction.status)) {
        paymentStatus = 'Paid';
    } else if (product.transaction.status === 'cancelled') {
        paymentStatus = 'Cancelled';
    }
  }

  return { ...maskedProduct, bids: maskedBids, paymentStatus };
};

// ==============================================================================
// 3. RELATED & SUGGESTED
// ==============================================================================
const getRelatedProducts = async (productId, categoryId) => {
  // Fetch up to 20 candidates, shuffle, pick 5 (Merged Logic)
  const candidates = await prisma.product.findMany({
    where: {
      category_id: categoryId,
      product_id: { not: parseInt(productId) },
      status: "active",
    },
    take: 20,
    orderBy: { start_time: 'desc' },
    include: {
      images: { take: 1 },
      bids: { take: 1, orderBy: { max_bid_amount: 'desc' }, include: { bidder: { select: { full_name: true } } } },
      seller: { select: { full_name: true, avg_rating: true, total_ratings: true } }
    },
  });

  const shuffled = candidates.sort(() => 0.5 - Math.random());
  return maskProducts(shuffled.slice(0, 5));
};

const getReplacementProduct = async (excludeIds = [], categoryId = null) => {
  const excluded = excludeIds.map((id) => parseInt(id)).filter((id) => !isNaN(id));

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
  return maskProducts(products)[0];
};

const getRandomProducts = async (limit = 10) => {
  const take = parseInt(limit);
  // Use raw query for true random performance if desired, or skip logic
  const count = await prisma.product.count({ where: { status: "active" } });
  const skip = Math.max(0, Math.floor(Math.random() * count) - take);

  const products = await prisma.product.findMany({
    where: { status: "active" },
    take, skip,
    include: {
      images: { take: 1 },
      bids: { take: 1, orderBy: { max_bid_amount: "desc" }, include: { bidder: { select: { full_name: true } } } },
      seller: { select: { full_name: true } },
      category: { include: { parent: true } },
    },
  });
  return maskProducts(products);
};

// ==============================================================================
// 4. SELLER FUNCTIONS
// ==============================================================================
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
    name, description, category_id, seller_id,
    start_time, end_time, start_price, buy_now_price,
  } = data;

  if (!name || !category_id || !seller_id || !start_time || !end_time) {
    throw new Error("Missing required fields");
  }

  return await prisma.product.create({
    data: {
      name, description,
      category_id: parseInt(category_id),
      seller_id: parseInt(seller_id),
      start_time: new Date(start_time),
      end_time: new Date(end_time),
      start_price, buy_now_price,
      status: "active",
    },
  });
};

const updateProduct = async (productId, data) => {
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

  if (bidCount > 0) throw new Error("Cannot delete product with existing bids");

  await prisma.product.update({
    where: { product_id: id },
    data: { status: "removed" },
  });
};

const rejectBidder = async (sellerId, productId, bidderId) => {
  const pId = parseInt(productId);
  const bId = parseInt(bidderId);

  const product = await prisma.product.findUnique({
    where: { product_id: pId },
  });

  if (!product) throw new Error("Product not found");
  if (product.seller_id !== sellerId) throw new Error("Unauthorized");

  // Ban
  await prisma.banned_Bidder.upsert({
    where: { product_id_bidder_id: { product_id: pId, bidder_id: bId } },
    create: { product_id: pId, bidder_id: bId },
    update: {},
  });

  // Recalculate Winner
  const bannedRecords = await prisma.banned_Bidder.findMany({
    where: { product_id: pId }, select: { bidder_id: true },
  });
  const bannedIds = bannedRecords.map((b) => b.bidder_id);

  const validBids = await prisma.bid_History.findMany({
    where: {
      product_id: pId,
      bidder_id: { notIn: bannedIds },
    },
    orderBy: { max_bid_amount: "desc" },
  });

  let newCurrentPrice = product.start_price;
  let newCurrentBidderId = null;

  if (validBids.length > 0) {
    newCurrentPrice = validBids[0].max_bid_amount;
    newCurrentBidderId = validBids[0].bidder_id;
  }

  await prisma.product.update({
    where: { product_id: pId },
    data: { current_price: newCurrentPrice, current_bidder_id: newCurrentBidderId },
  });

  return { message: "Bidder rejected.", newPrice: newCurrentPrice };
};

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
      rater_id: sellerId, rated_user_id: product.winner_id,
      product_id: pId, rating_value: -1, comment: "Winner did not pay",
    });
  } catch (e) {}

  if (product.transaction) {
    await prisma.transaction.update({
      where: { transaction_id: product.transaction.transaction_id },
      data: { status: "cancelled" },
    });
  }

  return await prisma.product.update({
    where: { product_id: pId },
    data: { status: "ended_no_winner" },
  });
};

// ==============================================================================
// 5. Q&A
// ==============================================================================
const addQuestion = async (userId, productId, content) => {
  return await prisma.product_Question.create({
    data: { asker_id: userId, product_id: parseInt(productId), question_text: content },
  });
};

const answerQuestion = async (sellerId, questionId, answer) => {
  const qId = parseInt(questionId);
  const question = await prisma.product_Question.findUnique({
    where: { question_id: qId }, include: { product: true },
  });

  if (!question) throw new Error("Question not found");
  if (question.product.seller_id !== sellerId) throw new Error("Unauthorized");

  return await prisma.product_Question.update({
    where: { question_id: qId },
    data: { answer_text: answer, answer_time: new Date() },
  });
};

const getProductQuestions = async (productId) => {
  return await prisma.product_Question.findMany({
    where: { product_id: parseInt(productId) },
    include: { asker: { select: { full_name: true } } },
    orderBy: { question_time: "desc" },
  });
};

// ==============================================================================
// 6. USER / BUYER FUNCTIONS
// ==============================================================================
const getUserPurchases = async (userId) => {
  const products = await prisma.product.findMany({
    where: { winner_id: parseInt(userId) },
    include: {
      images: { take: 1 },
      seller: { select: { full_name: true } },
      transaction: true,
      ratings: { where: { rater_id: parseInt(userId) }, take: 1 }
    },
    orderBy: { end_time: "desc" },
  });

  return products.map((p) => {
    let paymentStatus = "Unpaid";
    if (p.transaction) {
      if (['completed', 'pending_shipping', 'shipped'].includes(p.transaction.status)) paymentStatus = 'Paid';
      else if (p.transaction.status === 'cancelled') paymentStatus = 'Cancelled';
    }

    return {
      ...p,
      paymentStatus,
      canPay: !p.transaction || p.transaction.status === 'pending_payment',
      hasRated: p.ratings.length > 0
    };
  });
};

const getUserActiveBids = async (userId) => {
  const products = await prisma.product.findMany({
    where: {
      status: "active",
      end_time: { gt: new Date() },
      bids: { some: { bidder_id: parseInt(userId) } },
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

// ==============================================================================
// 7. PLACE BID (MERGED LOGIC)
// ==============================================================================
const placeBid = async (userId, productId, amountStr) => {
    const pId = parseInt(productId);
    const uId = parseInt(userId);
    const amount = parseFloat(amountStr);

    // 1. CHECK BAN (Your Logic - Priority)
    const isBanned = await prisma.banned_Bidder.findUnique({
        where: {
            product_id_bidder_id: { product_id: pId, bidder_id: uId }
        }
    });
    if (isBanned) throw new Error("You have been banned from this auction by the seller.");

    // 2. TRANSACTION + VALIDATION (Safe Logic)
    return await prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({
            where: { product_id: pId },
            include: { bids: { orderBy: { max_bid_amount: 'desc' }, take: 1 } }
        });

        if (!product) throw new Error("Product not found");
        if (product.status !== 'active') throw new Error("Auction is closed");
        if (new Date(product.end_time) < new Date()) throw new Error("Auction has ended");
        if (product.seller_id === uId) throw new Error("You cannot bid on your own product");

        // Min Bid Logic
        const highestBid = product.bids[0]?.max_bid_amount || product.start_price;
        const minBid = parseFloat(highestBid) + parseFloat(product.step_price);
        const effectiveMin = product.bids.length === 0 ? parseFloat(product.start_price) : minBid;

        if (amount < effectiveMin) {
            throw new Error(`Bid too low. Minimum required is $${effectiveMin.toLocaleString()}`);
        }
        if (product.buy_now_price && amount > parseFloat(product.buy_now_price)) {
            throw new Error(`Bid cannot exceed Buy Now price ($${product.buy_now_price})`);
        }

        // Auto-Extend
        let newEndTime = product.end_time;
        if (product.auto_extend_enabled) {
            const now = new Date();
            const timeRemainingMs = new Date(product.end_time) - now;
            if (timeRemainingMs <= 5 * 60 * 1000 && timeRemainingMs > 0) {
                newEndTime = new Date(new Date(product.end_time).getTime() + 10 * 60 * 1000);
            }
        }

        const newBid = await tx.bid_History.create({
            data: {
                product_id: pId,
                bidder_id: uId,
                max_bid_amount: amount,
                bid_time: new Date()
            }
        });

        await tx.product.update({
            where: { product_id: pId },
            data: {
                current_price: amount,
                current_bidder_id: uId,
                bid_count: { increment: 1 },
                end_time: newEndTime
            }
        });

        return newBid;
    });
};

// ==============================================================================
// 8. OTHERS
// ==============================================================================
const createTransaction = async (userId, productId, shippingData) => {
    const pId = parseInt(productId);
    const uId = parseInt(userId);
    const product = await prisma.product.findUnique({ where: { product_id: pId }, include: { transaction: true } });

    if (!product) throw new Error("Product not found");
    if (product.winner_id !== uId) throw new Error("You are not the winner");

    if (product.transaction) {
        if (['completed', 'shipped', 'pending_shipping'].includes(product.transaction.status)) {
            throw new Error("Transaction already processing");
        }
        return await prisma.transaction.update({
            where: { transaction_id: product.transaction.transaction_id },
            data: {
                status: 'completed',
                shipping_address: JSON.stringify(shippingData),
                payment_proof: 'Online Payment (Simulated)'
            }
        });
    }

    return await prisma.transaction.create({
        data: {
            product_id: pId,
            buyer_id: uId,
            seller_id: product.seller_id,
            status: 'completed',
            shipping_address: JSON.stringify(shippingData),
            payment_proof: 'Online Payment (Simulated)',
        }
    });
};

const getAuctionStats = async () => {
  const now = new Date();
  const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const [active, endingSoon] = await Promise.all([
    prisma.product.count({ where: { status: "active", end_time: { gt: now } } }),
    prisma.product.count({ where: { status: "active", end_time: { gt: now, lte: next24h } } }),
  ]);
  return { active, endingSoon24h: endingSoon };
};

const getFeaturedProducts = async (limit = 10) => {
  const products = await prisma.product.findMany({
    where: { status: "active", end_time: { gt: new Date() } },
    take: parseInt(limit),
    orderBy: { bid_count: "desc" },
    include: { images: { take: 1 }, category: true, bids: { take: 1 }, seller: { select: { full_name: true } } }
  });
  return maskProducts(products);
};

const getOngoingProducts = async (limit = 10) => {
  const products = await prisma.product.findMany({
    where: { status: "active", end_time: { gt: new Date() } },
    take: parseInt(limit),
    orderBy: { end_time: "asc" },
    include: { images: { take: 1 }, current_bidder: { select: { full_name: true } } }
  });
  return maskProducts(products);
};

const getCompetitiveProducts = async (limit = 10) => {
  const products = await prisma.product.findMany({
    where: { status: "active", end_time: { gt: new Date() } },
    take: parseInt(limit),
    orderBy: { current_price: "desc" },
    include: { images: { take: 1 }, bids: { take: 1 }, seller: { select: { full_name: true } } }
  });
  return maskProducts(products);
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
  getRandomProducts,
  placeBid,
};
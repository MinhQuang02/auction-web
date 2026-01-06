import prisma from "../lib/prisma.js";
import emailService from "./emailService.js";
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

/**
 * CORE LOGIC: Resolve the Auction "Battle"
 * Moved here to be accessible by both placeBid and rejectBidder.
 */
const resolveAuctionBattle = async (tx, productId) => {
  const pId = parseInt(productId);
  const product = await tx.product.findUnique({ where: { product_id: pId } });
  if (!product) throw new Error("Product not found");

  const step = parseFloat(product.step_price);
  const startPrice = parseFloat(product.start_price);

  const allBids = await tx.bid_History.findMany({
    where: { product_id: pId, status: { in: ['valid', 'auto'] } },
    orderBy: { bid_time: 'asc' }
  });

  const bidderMap = new Map();

  for (const bid of allBids) {
    const amount = parseFloat(bid.max_bid_amount);
    const existing = bidderMap.get(bid.bidder_id);

    if (!existing || amount > existing.capacity) {
      bidderMap.set(bid.bidder_id, {
        userId: bid.bidder_id, capacity: amount, type: bid.status, time: bid.bid_time
      });
    } else if (amount === existing.capacity && bid.status === 'auto') {
      existing.type = 'auto';
    }
  }

  const competitors = Array.from(bidderMap.values()).sort((a, b) => {
    if (b.capacity !== a.capacity) return b.capacity - a.capacity;
    return new Date(a.time) - new Date(b.time);
  });

  if (competitors.length === 0) {
    // Reset to start if no bidders left
    await tx.product.update({
      where: { product_id: pId },
      data: { current_price: startPrice, current_bidder_id: null, bid_count: 0 }
    });
    return { winnerId: null, price: startPrice };
  }

  const winner = competitors[0];
  const runnerUp = competitors[1];

  let newLocalPrice = startPrice;

  if (winner.type === 'valid') {
    newLocalPrice = winner.capacity;
  } else {
    const opponentMax = runnerUp ? runnerUp.capacity : 0;
    let calculated = opponentMax + step;
    if (!runnerUp) calculated = startPrice;
    newLocalPrice = Math.min(winner.capacity, calculated);
  }

  await tx.product.update({
    where: { product_id: pId },
    data: { current_price: newLocalPrice, current_bidder_id: winner.userId }
  });

  if (winner.type === 'auto') {
    const existingExactBid = await tx.bid_History.findFirst({
      where: { product_id: pId, bidder_id: winner.userId, max_bid_amount: newLocalPrice, status: 'valid' }
    });

    if (!existingExactBid) {
      await tx.bid_History.create({
        data: {
          product_id: pId, bidder_id: winner.userId, max_bid_amount: newLocalPrice, status: 'valid', bid_time: new Date()
        }
      });
      await tx.product.update({ where: { product_id: pId }, data: { bid_count: { increment: 1 } } });
    }
  }
  return { winnerId: winner.userId, price: newLocalPrice };
};

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
            select: { full_name: true, avg_rating: true, total_ratings: true },
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

  return await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { product_id: pId } });
    if (!product) throw new Error("Product not found");
    if (product.seller_id !== sellerId) throw new Error("Unauthorized");
    if (product.status !== 'active') throw new Error("Product is not active or sold");

    // Fetch user for email
    const bidder = await tx.user.findUnique({ where: { user_id: bId } });

    // Ban (Prevent Re-entry)
    await tx.banned_Bidder.upsert({
      where: { product_id_bidder_id: { product_id: pId, bidder_id: bId } },
      create: { product_id: pId, bidder_id: bId },
      update: {},
    });

    // Delete Bids (As requested: "xóa bên database")
    await tx.bid_History.deleteMany({
      where: { product_id: pId, bidder_id: bId }
    });

    // Recalculate Winner
    const result = await resolveAuctionBattle(tx, pId);

    // Email Notification
    if (bidder?.email) {
      emailService.sendBidderKickNotification(
        bidder.email,
        bidder.full_name || 'User',
        product.name,
        `${process.env.FRONTEND_URL}/product/${pId}`
      );
    }

    return { message: "Bidder rejected and bids removed.", newPrice: result.price };
  });
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
  } catch (e) { }

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
  const question = await prisma.product_Question.create({
    data: { asker_id: userId, product_id: parseInt(productId), question_text: content },
    include: {
      product: { include: { seller: true } },
      asker: true
    }
  });

  // Notification (B)
  if (question.product.seller?.email) {
    emailService.sendQuestionNotification(
      question.product.seller.email,
      question.product.seller.full_name,
      question.asker?.full_name || 'A Buyer',
      question.product.name,
      question.product_id,
      content
    );
  }

  return question;
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




// --- PUBLIC API: Place Manual Bid ---
const placeBid = async (userId, productId, amountStr) => {
  const pId = parseInt(productId);
  const uId = parseInt(userId);
  const amount = parseFloat(amountStr);

  return await prisma.$transaction(async (tx) => {
    // 1. Validation
    const product = await tx.product.findUnique({
      where: { product_id: pId },
      include: { bids: { orderBy: { max_bid_amount: 'desc' }, take: 1 } }
    });

    if (!product) throw new Error("Product not found");
    if (product.status !== 'active') throw new Error("Auction is closed");
    if (new Date(product.end_time) < new Date()) throw new Error("Auction has ended");
    if (product.seller_id === uId) throw new Error("You cannot bid on your own product");

    // 2. Check for Active Auto-Bid (User Instruction: Reject Manual if Auto exists)
    const existingAuto = await tx.bid_History.findFirst({
      where: { product_id: pId, bidder_id: uId, status: 'auto' }
    });
    if (existingAuto) {
      throw new Error("You have an active auto-bid. Please update that instead.");
    }

    // 3. Min Bid Validation
    // Note: We use the *Calculated* current state from Product, not just history
    const currentPrice = parseFloat(product.current_price);
    const minBid = product.bid_count === 0 ? parseFloat(product.start_price) : currentPrice + parseFloat(product.step_price);

    if (amount < minBid) {
      throw new Error(`Bid too low. Minimum required is $${minBid.toLocaleString()}`);
    }
    if (product.buy_now_price && amount > parseFloat(product.buy_now_price)) {
      throw new Error(`Bid cannot exceed Buy Now price`);
    }

    // 4. Insert Manual Bid
    const newBid = await tx.bid_History.create({
      data: {
        product_id: pId,
        bidder_id: uId,
        max_bid_amount: amount,
        status: 'valid', // Manual
        bid_time: new Date()
      }
    });

    // Update count immediately for the manual action
    await tx.product.update({
      where: { product_id: pId },
      data: { bid_count: { increment: 1 } }
    });

    // 5. Trigger Battle (Atomic)
    await resolveAuctionBattle(tx, pId);

    // Auto-Extend Check (Moved here or inside battle? Here is fine)
    if (product.auto_extend_enabled) {
      const now = new Date();
      const timeRemainingMs = new Date(product.end_time) - now;
      if (timeRemainingMs <= 5 * 60 * 1000 && timeRemainingMs > 0) {
        await tx.product.update({
          where: { product_id: pId },
          data: { end_time: new Date(new Date(product.end_time).getTime() + 10 * 60 * 1000) }
        });
      }
    }

    return newBid;
  });
};


// --- PUBLIC API: Place Auto Bid ---
const placeAutoBid = async (userId, productId, maxAmountStr) => {
  const pId = parseInt(productId);
  const uId = parseInt(userId);
  const maxAmount = parseFloat(maxAmountStr);

  return await prisma.$transaction(async (tx) => {
    // 1. Validation
    const product = await tx.product.findUnique({ where: { product_id: pId } });
    if (!product) throw new Error("Product not found");
    if (product.status !== 'active' || new Date(product.end_time) < new Date()) throw new Error("Auction ended");
    if (product.seller_id === uId) throw new Error("Cannot bid on own product");

    // 2. Upsert Auto Bid Logic
    // We deactivate old auto bids or just insert a new one?
    // Usually, a user has ONLY ONE active auto-bid limit.
    // We can update the existing one or insert new one. 
    // Inserting new one preserves history of "I increased my limit".
    // Let's insert new, relying on `resolveAuctionBattle` to pick the latest/highest.
    // But to keep things clean, let's mark old 'auto' bids as 'outdated'? 
    // Or valid 'resolveBattle' effectively ignores lower ones.
    // Let's UPDATE existing if present to keep DB clean, or Insert.

    const existingAuto = await tx.bid_History.findFirst({
      where: { product_id: pId, bidder_id: uId, status: 'auto' }
    });

    if (existingAuto) {
      if (maxAmount <= parseFloat(existingAuto.max_bid_amount)) {
        throw new Error("New auto-bid must be higher than your current auto-bid.");
      }
      // Update
      await tx.bid_History.update({
        where: { bid_id: existingAuto.bid_id },
        data: { max_bid_amount: maxAmount, bid_time: new Date() }
      });
    } else {
      // Create New
      await tx.bid_History.create({
        data: {
          product_id: pId,
          bidder_id: uId,
          max_bid_amount: maxAmount,
          status: 'auto', // AUTO flag
          bid_time: new Date()
        }
      });
    }

    // 3. Trigger Battle
    const result = await resolveAuctionBattle(tx, pId);
    return result;
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

  let trans;

  if (product.transaction) {
    if (['completed', 'shipped', 'pending_shipping'].includes(product.transaction.status)) {
      throw new Error("Transaction already processing");
    }
    trans = await prisma.transaction.update({
      where: { transaction_id: product.transaction.transaction_id },
      data: {
        status: 'completed',
        shipping_address: JSON.stringify(shippingData),
        payment_proof: 'Online Payment (Simulated)'
      }
    });
  } else {
    trans = await prisma.transaction.create({
      data: {
        product_id: pId,
        buyer_id: uId,
        seller_id: product.seller_id,
        status: 'completed',
        shipping_address: JSON.stringify(shippingData),
        payment_proof: 'Online Payment (Simulated)',
      }
    });
  }

  // Notification (C)
  const [buyer, seller] = await Promise.all([
    prisma.user.findUnique({ where: { user_id: uId } }),
    prisma.user.findUnique({ where: { user_id: product.seller_id } })
  ]);

  if (buyer && seller) {
    emailService.sendTransactionEmails(buyer, seller, product, trans, shippingData);
  }

  return trans;
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
  placeAutoBid
};
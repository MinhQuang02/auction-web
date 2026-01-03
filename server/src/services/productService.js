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
    // Format for Postgres tsquery (simple approach: AND all terms)
    // Replace spaces with ' & '
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
  const productsWithMasking = maskProducts(products);
  const productsWithMasking = products.map((p) => {
    // Mask Seller
    let maskedSellerName = "***";
    if (p.seller?.full_name) {
      maskedSellerName = "***" + p.seller.full_name.trim().slice(-3);
    }

    // Mask Leading Bidder (if exists)
    let maskedBidder = null;
    if (p.bids && p.bids.length > 0) {
      // Deep copy first bid to avoid mutating reference issues
      const firstBid = { ...p.bids[0] };
      if (firstBid.bidder?.full_name) {
        firstBid.bidder = {
          ...firstBid.bidder,
          full_name: "***" + firstBid.bidder.full_name.trim().slice(-3),
        };
      } else {
        // Fallback if bidder name missing
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
      transaction: true, // Get transaction info if exists
    },
  });

  if (!product) return null;

  // Mask Bidder Names: *** + last 3 characters
  const maskedProduct = maskProducts([product])[0];
  const maskedBids = product.bids.map((bid) => {
    // Safety check if bidder is missing
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

  // Calculate generic payment status if winner
  let paymentStatus = "Unpaid";
  if (product.transaction) {
    if (product.transaction.status === "completed") paymentStatus = "Paid";
    else if (product.transaction.status === "pending_shipping")
      paymentStatus = "Paid";
    else if (product.transaction.status === "shipped") paymentStatus = "Paid";
    else if (product.transaction.status === "cancelled")
      paymentStatus = "Cancelled";
  }

  return { ...maskedProduct, paymentStatus };
};

// 3. RELATED PRODUCTS
const getRelatedProducts = async (productId, categoryId) => {
  // Fetch a pool of candidate products from the same category
  // We fetch up to 20 to shuffle and pick 5, ensuring variety
  const candidates = await prisma.product.findMany({
    where: {
      category_id: categoryId,
      product_id: { not: parseInt(productId) },
      status: "active",
    },
    take: 20,
    orderBy: { start_time: 'desc' }, // Get recent ones
    include: {
      images: { take: 1 },
      bids: { take: 1, orderBy: { max_bid_amount: 'desc' }, include: { bidder: { select: { full_name: true } } } },
      seller: { select: { full_name: true, avg_rating: true, total_ratings: true } }
    },
  });

  // Shuffle array using Fisher-Yates or simple sort
  const shuffled = candidates.sort(() => 0.5 - Math.random());

  // Masking Logic (Essential for public view)
  const selected = shuffled.slice(0, 5);
  return maskProducts(selected);
};

const getReplacementProduct = async (excludeIds = [], categoryId = null) => {
  // Sanitize excludeIds
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

  // Masking Logic (Duplicated from searchProducts - simplified)
  return maskProducts(products)[0];
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
      // Winner details to show in "Sold" tab
      winner: {
        select: { user_id: true, full_name: true },
      },
      // Ratings to see if I already rated them
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

  // Soft delete
  await prisma.product.update({
    where: { product_id: id },
    data: { status: "removed" },
  });
};

// TASK 3.3: REJECT BIDDER
const rejectBidder = async (sellerId, productId, bidderId) => {
  const pId = parseInt(productId);
  const bId = parseInt(bidderId);

  // 1. Verify Ownership
  const product = await prisma.product.findUnique({
    where: { product_id: pId },
  });

  if (!product) throw new Error("Product not found");
  if (product.seller_id !== sellerId) throw new Error("Unauthorized");

  // 2. Ban the User (Using your Banned_Bidder model)
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

  // 3. RECALCULATE WINNER
  const bannedRecords = await prisma.banned_Bidder.findMany({
    where: { product_id: pId },
    select: { bidder_id: true },
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
      current_bidder_id: newBidderId,
    },
  });

  return {
    message: "Bidder rejected and price updated",
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

  // Verify ownership via Product relation
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

// USER PROFILE: My Purchases (Won Items + Payment Status)
const getUserPurchases = async (userId) => {
  const products = await prisma.product.findMany({
    where: {
      winner_id: parseInt(userId),
    },
    include: {
      images: { take: 1 },
      seller: { select: { full_name: true } },
      transaction: true, // Get transaction status
      ratings: {
        where: { rater_id: parseInt(userId) },
        take: 1
      }
    },
    orderBy: { end_time: "desc" },
  });

  return products.map((p) => {
    // Determine payment status
    let paymentStatus = "Unpaid";
    if (p.transaction) {
      // Logic for Paid/Unpaid mapping to Frontend
      // 'pending_shipping', 'shipped', 'completed' => Paid
      if (['completed', 'pending_shipping', 'shipped'].includes(p.transaction.status)) {
        paymentStatus = 'Paid';
      } else if (p.transaction.status === 'cancelled') {
        paymentStatus = 'Cancelled';
      }
      if (p.transaction.status === "completed") paymentStatus = "Paid";
      else if (p.transaction.status === "pending_shipping")
        paymentStatus = "Paid";
      else if (p.transaction.status === "shipped") paymentStatus = "Paid";
      else if (p.transaction.status === "cancelled")
        paymentStatus = "Cancelled";
    }

    return {
      ...p,
      paymentStatus, // 'Paid', 'Unpaid', 'Cancelled'
      canPay: !p.transaction || p.transaction.status === 'pending_payment',
      hasRated: p.ratings.length > 0 // Boolean to check if user already rated
      canPay: !p.transaction || p.transaction.status === "pending_payment",
    };
  });
};

// USER PROFILE: My Active Bids
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
      // Fetch MY highest bid on this object
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

// NEW: Cancel Transaction (Task 3.5)
const cancelTransaction = async (sellerId, productId) => {
  const pId = parseInt(productId);

  // 1. Get Product & Winner
  const product = await prisma.product.findUnique({
    where: { product_id: pId },
    include: { transaction: true }, // Make sure we know about transaction
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
      comment: "Winner did not pay",
    });
  } catch (e) {
    console.log("Auto-rating skipped:", e.message);
  }

  // If transaction exists, cancel it too
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
      // Optionally reset winner/bidder if you want to allow re-bidding or just close it
    },
  });
};

// Helper: Mask Names
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

// NEW: Random Products for Hero
const getRandomProducts = async (limit = 10) => {
  const take = parseInt(limit);

  // Get Random IDs
  const rawIds = await prisma.$queryRaw`
    SELECT product_id FROM "Product"
    WHERE status = 'active' AND end_time > NOW()
    ORDER BY RANDOM()
    LIMIT ${take}
  `;

  if (!rawIds || rawIds.length === 0) return [];

  const ids = rawIds.map((r) => r.product_id);

  const products = await prisma.product.findMany({
    where: { product_id: { in: ids } },
    include: {
      images: { take: 1 },
      bids: {
        take: 1,
        orderBy: { max_bid_amount: "desc" },
        include: { bidder: { select: { full_name: true } } },
      },
      seller: { select: { full_name: true, avg_rating: true } },
      category: { include: { parent: true } },
    },
  });

  return maskProducts(products);
};


// NEW: Featured Products (Top 10 by bid count) - Hottest
const getFeaturedProducts = async (limit = 10) => {
  const products = await prisma.product.findMany({
    where: {
      status: "active",
      end_time: { gt: new Date() },
    },
    take: parseInt(limit),
    orderBy: { bid_count: "desc" },
    include: {
      images: { take: 1 },
      category: { include: { parent: true } },
      bids: { take: 1, orderBy: { max_bid_amount: 'desc' }, include: { bidder: { select: { full_name: true } } } },
      seller: { select: { full_name: true } }
    }
      bids: { take: 1, orderBy: { max_bid_amount: "desc" } },
      seller: { select: { full_name: true } },
    },
  });
  return maskProducts(products);
};

// NEW: Ongoing Products (Top 10 ending soon) - Closing Soon
const getOngoingProducts = async (limit = 10) => {
  const products = await prisma.product.findMany({
    where: {
      status: "active",
      end_time: { gt: new Date() },
    },
    take: parseInt(limit),
    orderBy: { end_time: "asc" }, // Ending soonest
    include: {
      images: { take: 1 },
      current_bidder: { select: { full_name: true } },
      bids: { take: 1, orderBy: { max_bid_amount: 'desc' }, include: { bidder: { select: { full_name: true } } } }, // Add bids to ensure we have bid info if needed
    }
    },
  });
  return maskProducts(products);
};

// NEW: Competitive Products (High Price/Value)
const getCompetitiveProducts = async (limit = 10) => {
  const products = await prisma.product.findMany({
    where: {
      status: "active",
      end_time: { gt: new Date() },
    },
    take: parseInt(limit),
    orderBy: { current_price: "desc" }, // Highest Price
    include: {
      images: { take: 1 },
      bids: { take: 1, orderBy: { max_bid_amount: 'desc' }, include: { bidder: { select: { full_name: true } } } },
      seller: { select: { full_name: true } }
    }
      bids: { take: 1, orderBy: { max_bid_amount: "desc" } },
      seller: { select: { full_name: true } },
    },
  });
  return maskProducts(products);
};

// NEW: Create Transaction (Pay Now)
// NEW: Create Transaction (Pay Now)
const createTransaction = async (userId, productId, shippingData) => {
  const pId = parseInt(productId);
  const uId = parseInt(userId);

  // 1. Verify Product & Winner
  const product = await prisma.product.findUnique({
    where: { product_id: pId },
    include: { transaction: true },
  });

  if (!product) throw new Error("Product not found");
  if (product.winner_id !== uId) throw new Error("You are not the winner of this item");

  // 2. Handle Existing vs New Transaction
  if (product.transaction) {
    // If already paid, block
    if (['completed', 'shipped', 'pending_shipping'].includes(product.transaction.status)) {
      throw new Error("Transaction already completed or processing");
    }
  if (product.winner_id !== uId)
    throw new Error("You are not the winner of this item");
  if (product.transaction) throw new Error("Transaction already exists");

  // 2. Create Transaction
  const transaction = await prisma.transaction.create({
    data: {
      product_id: pId,
      buyer_id: uId,
      seller_id: product.seller_id,
      status: "pending_shipping", // Payment simulated -> waiting shipping
      shipping_address: JSON.stringify(shippingData),
      payment_proof: "Online Payment (Simulated)",
    },
  });

    // Update existing (e.g. from Chat 'pending_payment')
    return await prisma.transaction.update({
      where: { transaction_id: product.transaction.transaction_id },
      data: {
        status: 'completed', // User requested 'completed' upon payment
        shipping_address: JSON.stringify(shippingData),
        payment_proof: 'Online Payment (Simulated)',
        // created_at: new Date() // Keep original creation time (e.g. chat start)
      }
    });
  } else {
    // Create New
    return await prisma.transaction.create({
      data: {
        product_id: pId,
        buyer_id: uId,
        seller_id: product.seller_id,
        // User requested 'completed' upon payment
        status: 'completed',
        shipping_address: JSON.stringify(shippingData),
        payment_proof: 'Online Payment (Simulated)',
      }
    });
  }
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

// TASK 4: PLACE BID
const placeBid = async (userId, productId, bidAmount) => {
  const pId = parseInt(productId);
  const uId = parseInt(userId);
  const amount = parseFloat(bidAmount);

  return await prisma.$transaction(async (tx) => {
    // 1. Fetch Product (Fresh)
    const product = await tx.product.findUnique({
      where: { product_id: pId }
    });

    if (!product) throw new Error("Product not found");
    // Validate Status
    if (product.status !== 'active') throw new Error("Auction is not active");
    if (new Date() > product.end_time) throw new Error("Auction has ended");
    if (product.seller_id === uId) throw new Error("You cannot bid on your own product");

    // Validate Amount
    // If no bids yet, bid must be >= start_price
    // If bids exist, bid must be >= current_price + step_price
    // HOWEVER: The requirement says: "Current Leading Bid < User Bid <= Buy Now Price"
    // And usually: User Bid >= Current Leading Bid + Step.

    // We'll use strict logic:
    // If bid_count == 0, minBid = start_price
    // If bid_count > 0, minBid = current_price + step_price
    let minBid = parseFloat(product.start_price);
    if (product.bid_count > 0) {
      minBid = parseFloat(product.current_price) + parseFloat(product.step_price);
    }

    if (amount < minBid) {
      throw new Error(`Bid amount must be at least $${minBid}`);
    }

    if (product.buy_now_price && amount > parseFloat(product.buy_now_price)) {
      throw new Error(`Bid cannot exceed Buy Now price ($${product.buy_now_price})`);
    }

    // 2. Auto-Extension (Anti-Sniping)
    let newEndTime = product.end_time;
    if (product.auto_extend_enabled) {
      // Fetch Config
      const configs = await tx.system_Config.findMany({
        where: { setting_key: { in: ['update_times', 'append_times'] } }
      });

      // Default values if config missing: Check last 5 mins, add 10 mins
      let updateTimeMinutes = 5;
      let appendTimeMinutes = 10;

      const updateTimeConfig = configs.find(c => c.setting_key === 'update_times');
      const appendTimeConfig = configs.find(c => c.setting_key === 'append_times');

      if (updateTimeConfig) updateTimeMinutes = parseInt(updateTimeConfig.setting_value) || 5;
      if (appendTimeConfig) appendTimeMinutes = parseInt(appendTimeConfig.setting_value) || 10;

      const now = new Date();
      const timeRemainingMs = new Date(product.end_time) - now;
      const updateTimeMs = updateTimeMinutes * 60 * 1000;

      if (timeRemainingMs <= updateTimeMs && timeRemainingMs > 0) {
        // Extend
        newEndTime = new Date(new Date(product.end_time).getTime() + (appendTimeMinutes * 60 * 1000));
      }
    }

    // 3. Create Bid History
    const newBid = await tx.bid_History.create({
      data: {
        product_id: pId,
        bidder_id: uId,
        max_bid_amount: amount,
        bid_time: new Date()
      }
    });

    // 4. Update Product
    const updatedProduct = await tx.product.update({
      where: { product_id: pId },
      data: {
        current_price: amount,
        current_bidder_id: uId,
        bid_count: { increment: 1 },
        end_time: newEndTime
      }
    });

    return { bid: newBid, product: updatedProduct };
  });
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

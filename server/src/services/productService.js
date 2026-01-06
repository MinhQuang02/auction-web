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
      const { max_auto_bid_amount, ...safeBid } = bid;
      let maskedBidder = safeBid.bidder;
      if (safeBid.bidder?.full_name) {
        maskedBidder = {
          ...safeBid.bidder,
          full_name: "***" + safeBid.bidder.full_name.trim().slice(-3),
        };
      } else if (safeBid.bidder) {
        maskedBidder = { ...safeBid.bidder, full_name: "***" };
      }
      return { ...safeBid, bidder: maskedBidder };
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

  // 1. Fetch Active Competitors
  // A. Active Auto Bids
  const autoBids = await tx.bid_History.findMany({
    where: { product_id: pId, status: "auto" },
    include: { bidder: true },
  });

  // B. Current Highest Manual Bid (Valid)
  const highestManualBid = await tx.bid_History.findFirst({
    where: { product_id: pId, status: "valid" },
    orderBy: { max_bid_amount: "desc" },
    include: { bidder: true },
  });

  // 2. Normalize Competitors
  const competitors = [];

  // Add Manual Leader
  if (highestManualBid) {
    competitors.push({
      id: highestManualBid.bid_id,
      userId: highestManualBid.bidder_id,
      capacity: parseFloat(highestManualBid.max_bid_amount), // Fixed amount
      type: "valid", // Manual
      bidTime: highestManualBid.bid_time,
      bidder: highestManualBid.bidder,
    });
  }

  // Add Auto Bidders
  // Note: A user can only be in one state strictly, but if DB has garbage, we handle it.
  for (const ab of autoBids) {
    // Capacity is the HIDDEN Max Amount
    const cap = ab.max_auto_bid_amount
      ? parseFloat(ab.max_auto_bid_amount)
      : parseFloat(ab.max_bid_amount);

    competitors.push({
      id: ab.bid_id,
      userId: ab.bidder_id,
      capacity: cap,
      type: "auto",
      bidTime: ab.bid_time,
      bidder: ab.bidder,
    });
  }

  // 3. Determine Ranking
  // Sort by Capacity DESC, then Time ASC (Earliest bid at that capacity wins)
  competitors.sort((a, b) => {
    if (a.capacity !== b.capacity) return b.capacity - a.capacity;
    return new Date(a.bidTime) - new Date(b.bidTime);
  });

  // Handle No Bids
  if (competitors.length === 0) {
    await tx.product.update({
      where: { product_id: pId },
      data: {
        current_price: startPrice,
        current_bidder_id: null,
        bid_count: 0,
      },
    });
    return { winnerId: null, price: startPrice };
  }

  const winner = competitors[0];
  const runnerUp = competitors[1];

  // 4. Calculate Winning Price
  let newPrice = startPrice;

  if (!runnerUp) {
    // Winner is uncontested (among active logic checks)
    // If Manual: They pay what they bid.
    // If Auto: They pay Start Price OR Current Price (if they just joined).
    // Logic: If I am the only one, I pay the floor price.
    // However, to avoid dropping price if checks happen, max(start, current)?
    // But 'current' might be stale.
    // Let's use Start Price as base.
    if (winner.type === "valid") {
      newPrice = winner.capacity;
    } else {
      // Auto: Wins at start price (or keeps current if nobody pushed)
      // If we strictly follow "Amount: Current + Step" from entry, we should respect that minimum.
      // But let's assume 'One King' resets price to fair market value (Second Best + Step).
      // If Second Best is 0/Null, Fair Value = Start Price.
      newPrice = Math.max(startPrice, parseFloat(product.current_price)); // Safety to not drop price?
      // Actually, if everyone else cancels, price SHOULD drop.
      // But standard proxy behavior: You hold it at minimum.
      // IMPORTANT: In "Step A", we set amount = Current + Step.
      // So let's respect the current amount stored in the bid record if meaningful?
      // But we are recalculating.
      // Let's stick to the prompt's Battle Resolve: "New Current Price = Loser's Max + Step".
      // If no loser, Price = Start Price.
      // But we have a constraint: Price cannot go below Start Price.
      newPrice = startPrice;
      // Note: If newPrice calculated is lower than current product price, it might confuse users.
      // But technically correct if higher bidder rescinded.
    }
  } else {
    // Battle!
    // Price = RunnerUp Capacity + Step
    const calculated = runnerUp.capacity + step;
    // Cap at Winner's Capacity
    newPrice = Math.min(winner.capacity, calculated);
  }

  // Ensure we don't drop below start price
  newPrice = Math.max(newPrice, startPrice);

  // 5. Update Winner State
  if (winner.type === "auto") {
    // Update the visual bid amount to the new calculated price
    await tx.bid_History.update({
      where: { bid_id: winner.id },
      data: {
        max_bid_amount: newPrice, // Visual Price
        status: "auto", // Remains Auto
      },
    });
  } else {
    // Manual Winner
    // Their bid amount is fixed (winner.capacity).
    // But if we calculated a lower price (proxy style) for proper display?
    // Manual bids are usually NOT proxy in this hybrid system. manual = flat amount.
    // So if winner is manual, newPrice MUST be winner.capacity
    newPrice = winner.capacity;
  }

  // 6. Outcome: Defeated Auto-Bidders -> 'outbid'
  const loserIds = competitors
    .slice(1)
    .filter((c) => c.type === "auto")
    .map((c) => c.id);

  if (loserIds.length > 0) {
    await tx.bid_History.updateMany({
      where: { bid_id: { in: loserIds } },
      data: { status: "outbid" },
    });
  }

  // Notify ALL Losers (Manual and Auto)
  // We want to notify the immediate losers in this battle resolution.
  const losers = competitors
    .slice(1)
    .map((c) => c.bidder)
    .filter((b) => b && b.email); // Ensure valid user objects

  if (losers.length > 0) {
    // Async notification (Fire & Forget)
    emailService.sendOutbidNotifications(losers, product.name, pId, newPrice);
  }

  // 7. Update Product Global State
  await tx.product.update({
    where: { product_id: pId },
    data: {
      current_price: newPrice,
      current_bidder_id: winner.userId,
      // Recalculate bid count because we might have collapsed/changed status?
      // Or just keep incrementing. History rows still exist.
      // Proper: Count 'valid', 'auto', 'outbid' (all history)
      // Usually bid_count increases on new entry. We don't change it here.
    },
  });

  return { winnerId: winner.userId, price: newPrice };
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
    const status = isBanned ? 'rejected' : bid.status;

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
      if (['completed', 'shipped', 'pending_shipping'].includes(p.transaction.status)) paymentStatus = 'Paid';
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

// --- UNIFIED PUBLIC API: Place Bid ---
const placeBid = async (userId, productId, amountStr, isAutoBid = false) => {
  const pId = parseInt(productId);
  const uId = parseInt(userId);
  const inputAmount = parseFloat(amountStr);

  return await prisma.$transaction(async (tx) => {
    // 1. Validation & Locking
    const product = await tx.product.findUnique({
      where: { product_id: pId },
    });

    if (!product) throw new Error("Product not found");
    if (product.status !== "active") throw new Error("Auction is closed");
    if (new Date(product.end_time) < new Date())
      throw new Error("Auction has ended");
    if (product.seller_id === uId)
      throw new Error("You cannot bid on your own product");

    const step = parseFloat(product.step_price);
    const currentPrice = parseFloat(product.current_price);
    const startPrice = parseFloat(product.start_price);

    // Calculate Minimum Entry Requirement
    // Case: No bids yet -> Start Price. One bid -> Current + Step.
    const minEntryPrice = product.bid_count === 0 ? startPrice : currentPrice + step;

    if (inputAmount < minEntryPrice) {
      throw new Error(
        `Bid too low. Minimum required is $${minEntryPrice.toLocaleString()}`
      );
    }
    if (product.buy_now_price && inputAmount > parseFloat(product.buy_now_price)) {
      throw new Error(`Bid cannot exceed Buy Now price`);
    }

    // ==============================================================================
    // STEP A: Fetch Current State (The "Defender")
    // ==============================================================================
    // Find the single active auto-bidder if any.
    // Constraint: Max 1 active auto-bidder per product.
    const defender = await tx.bid_History.findFirst({
      where: { product_id: pId, status: "auto" },
    });

    // ==============================================================================
    // STEP B: Branching Logic
    // ==============================================================================

    let outputNewPrice = currentPrice;
    let outputWinnerId = uId; // Tentatively Challenger
    let oldDefenderUserToNotify = null;
    let challengerUserToNotify = null; // If they lose immediately

    if (!defender) {
      // ---------------------------------------------------------
      // CASE 1: No Existing Auto-Bidder (Open Field)
      // ---------------------------------------------------------
      if (!isAutoBid) {
        // Manual Challenger
        // If Incoming is Manual: Create a standard bid record (status: 'VALID'). Update Product price.
        await tx.bid_History.create({
          data: {
            product_id: pId,
            bidder_id: uId,
            max_bid_amount: inputAmount,
            status: "valid",
            bid_time: new Date(),
          },
        });
        outputNewPrice = inputAmount;
      } else {
        // Auto Challenger
        // If Incoming is Auto: Create a record with status: 'AUTO', amount: currentPrice + step, and max_auto_bid_amount: user_input.
        // We use minEntryPrice as the "Current + Step" equivalent for the first visible bid amount.
        const startingBid = minEntryPrice;

        await tx.bid_History.create({
          data: {
            product_id: pId,
            bidder_id: uId,
            max_bid_amount: startingBid, // Visible Amount
            max_auto_bid_amount: inputAmount, // Hidden Cap
            status: "auto",
            bid_time: new Date(),
          },
        });
        outputNewPrice = startingBid;
      }
    } else {
      // ---------------------------------------------------------
      // CASE 2: Defender EXISTS
      // ---------------------------------------------------------
      const defenderMax = parseFloat(defender.max_auto_bid_amount);

      // Handle Self-Bidding edge case (Defender updating their own bid)
      // If user is the defender, we treat them as a "Challenger" who beats themselves?
      // Or we just update their max?
      // Logic: If I am defender and I bid higher, I update my max.
      if (defender.bidder_id === uId && isAutoBid) {
        if (inputAmount <= defenderMax) throw new Error("New auto-bid must be higher than your current max.");
        // Update Max Amount
        await tx.bid_History.update({
          where: { bid_id: defender.bid_id },
          data: { max_auto_bid_amount: inputAmount }
        });
        return { winnerId: uId, price: parseFloat(defender.max_bid_amount) }; // No price change, just capacity
      }

      if (!isAutoBid) {
        // --- SUB-CASE 2.1: Challenger is MANUAL ---
        const challengerAmount = inputAmount;

        // "Logic: Compare Challenger Amount vs Defender.max_auto_bid_amount"
        if (challengerAmount <= defenderMax) { // Assuming Tie goes to Defender (Defender was there first)
          // => Defender Wins
          // 1. Create Challenger's record ('VALID', amount: Challenger Amount).
          await tx.bid_History.create({
            data: {
              product_id: pId,
              bidder_id: uId,
              max_bid_amount: challengerAmount,
              status: "valid",
              bid_time: new Date(),
            }
          });
          challengerUserToNotify = await tx.user.findUnique({ where: { user_id: uId } });

          // 2. Auto-Reply: The system immediately places a *new* bid for the Defender
          // New Price = Challenger Amount + Step.
          let newDefPrice = challengerAmount + step;
          newDefPrice = Math.min(defenderMax, newDefPrice); // Cap at Defender Max

          // Archive old Defender record to enforce "At Most One Auto"
          await tx.bid_History.update({
            where: { bid_id: defender.bid_id },
            data: { status: "outbid" }
          });

          await tx.bid_History.create({
            data: {
              product_id: pId,
              bidder_id: defender.bidder_id,
              max_bid_amount: newDefPrice,
              max_auto_bid_amount: defenderMax,
              status: "auto",
              bid_time: new Date()
            }
          });

          outputNewPrice = newDefPrice;
          outputWinnerId = defender.bidder_id;

        } else {
          // => Challenger Wins (Challenger > Defender Max)
          // 1. Update Defender status from 'AUTO' to 'VALID' (Defender is defeated).
          // We mark it as 'valid' history (or 'outbid'? Query implies 'valid' but beaten).
          // Prompt says "Update Defender status ... to 'VALID'".
          await tx.bid_History.update({
            where: { bid_id: defender.bid_id },
            data: { status: "valid" }
          });
          oldDefenderUserToNotify = await tx.user.findUnique({ where: { user_id: defender.bidder_id } });

          // 2. Create Challenger's record (status: 'VALID', amount: Challenger Amount).
          await tx.bid_History.create({
            data: {
              product_id: pId,
              bidder_id: uId,
              max_bid_amount: challengerAmount,
              status: "valid",
              bid_time: new Date()
            }
          });

          outputNewPrice = challengerAmount;
          outputWinnerId = uId;
        }

      } else {
        // --- SUB-CASE 2.2: Challenger is ALSO AUTO ---
        const challengerMax = inputAmount;

        if (challengerMax > defenderMax) {
          // => Challenger Wins
          // 1. Update Defender - Defeated
          await tx.bid_History.update({
            where: { bid_id: defender.bid_id },
            data: { status: "valid" }
          });
          oldDefenderUserToNotify = await tx.user.findUnique({ where: { user_id: defender.bidder_id } });

          // 2. Create Challenger's record ('AUTO')
          // Price Calculation: Set current price to Defender Max + Step.
          let newPrice = defenderMax + step;
          newPrice = Math.min(challengerMax, newPrice); // Safety check so we don't exceed challenger max

          await tx.bid_History.create({
            data: {
              product_id: pId,
              bidder_id: uId,
              max_bid_amount: newPrice,
              max_auto_bid_amount: challengerMax,
              status: "auto",
              bid_time: new Date()
            }
          });

          outputNewPrice = newPrice;
          outputWinnerId = uId;

        } else if (challengerMax < defenderMax) {
          // => Defender Wins
          // 1. Create Challenger's record ('VALID' - immediately defeated)
          await tx.bid_History.create({
            data: {
              product_id: pId,
              bidder_id: uId,
              max_bid_amount: challengerMax, // They were willing to go up to this
              status: "valid",
              bid_time: new Date()
            }
          });
          challengerUserToNotify = await tx.user.findUnique({ where: { user_id: uId } });

          // 2. Auto-Reply: The system places a new bid for the Defender.
          // Price Calculation: Set current price to Challenger Max + Step.
          let newDefPrice = challengerMax + step;
          newDefPrice = Math.min(defenderMax, newDefPrice);

          // Archive Old
          await tx.bid_History.update({
            where: { bid_id: defender.bid_id },
            data: { status: "outbid" }
          });

          await tx.bid_History.create({
            data: {
              product_id: pId,
              bidder_id: defender.bidder_id,
              max_bid_amount: newDefPrice,
              max_auto_bid_amount: defenderMax,
              status: "auto",
              bid_time: new Date()
            }
          });

          outputNewPrice = newDefPrice;
          outputWinnerId = defender.bidder_id;

        } else {
          // => TIE-BREAKER (Challenger Max == Defender Max)
          // Rule: The existing Defender (First comer) wins.

          // 1. Create Challenger's record ('VALID')
          await tx.bid_History.create({
            data: {
              product_id: pId,
              bidder_id: uId,
              max_bid_amount: challengerMax,
              status: "valid",
              bid_time: new Date()
            }
          });
          challengerUserToNotify = await tx.user.findUnique({ where: { user_id: uId } });

          // 2. Update Defender's current price to their Max Amount.
          // Archive Old
          await tx.bid_History.update({
            where: { bid_id: defender.bid_id },
            data: { status: "outbid" }
          });

          await tx.bid_History.create({
            data: {
              product_id: pId,
              bidder_id: defender.bidder_id,
              max_bid_amount: defenderMax, // Reached Max
              max_auto_bid_amount: defenderMax,
              status: "auto",
              bid_time: new Date()
            }
          });

          outputNewPrice = defenderMax;
          outputWinnerId = defender.bidder_id;
        }
      }
    }

    // ==============================================================================
    // 3. Post-Processing
    // ==============================================================================
    // Product Update: ALWAYS update currentPrice, bidCount, and winnerId
    await tx.product.update({
      where: { product_id: pId },
      data: {
        current_price: outputNewPrice,
        current_bidder_id: outputWinnerId,
        bid_count: { increment: 1 }
      }
    });

    // Auto-Extend
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

    // Email Notifications
    if (oldDefenderUserToNotify?.email) {
      emailService.sendOutbidNotifications([oldDefenderUserToNotify], product.name, pId, outputNewPrice);
    }
    if (challengerUserToNotify?.email) {
      emailService.sendOutbidNotifications([challengerUserToNotify], product.name, pId, outputNewPrice);
    }

    return {
      message: "Bid processed",
      winnerId: outputWinnerId,
      price: outputNewPrice
    };
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
  placeBid
};
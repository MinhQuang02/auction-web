import productService from "../services/productService.js";
import prisma from "../lib/prisma.js";

// 1. SEARCH LIST (With "New" Badge)
const getProducts = async (req, res) => {
  try {
    const {
      keyword,
      category_id,
      sort_by,
      limit = 12,
      page = 1,
      status,
    } = req.query;
    const offset = (page - 1) * limit;

    const { products, total } = await productService.searchProducts({
      keyword,
      categoryId: category_id,
      sortBy: sort_by,
      limit,
      offset,
      status,
    });

    const NEW_THRESHOLD_MINUTES = 60;
    const now = new Date();

    const productsWithBadge = products.map((p) => {
      const postTime = new Date(p.start_time);
      const diffMs = now - postTime;
      const diffMins = Math.floor(diffMs / 60000);

      return {
        ...p,
        is_new: diffMins <= NEW_THRESHOLD_MINUTES,
      };
    });

    res.status(200).json({
      products: productsWithBadge,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 2. PRODUCT DETAIL (With Related Items)
const getProductDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return res.status(400).json({ message: "Invalid Product ID" });
    }

    const product = await productService.getProductById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const related = await productService.getRelatedProducts(
      productId,
      product.category_id
    );

    const questions = await productService.getProductQuestions(productId);

    res.status(200).json({
      product,
      related_products: related,
      questions: questions,
    });
  } catch (error) {
    console.error("Get Detail Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 3. CREATE PRODUCT (Seller Feature)
const createProduct = async (req, res) => {
  try {
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const sellerId = req.auth.userId;
    const {
      name,
      description,
      start_price,
      step_price,
      buy_now_price,
      end_time,
      category_id,
      auto_extend_enabled,
      images,
    } = req.body;

    // Validation
    if (!name || !start_price || !step_price || !category_id || !end_time) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!images || !Array.isArray(images) || images.length < 3) {
      return res
        .status(400)
        .json({ message: "You must provide at least 3 images." });
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        start_price: parseFloat(start_price),
        step_price: parseFloat(step_price),
        current_price: parseFloat(start_price),
        buy_now_price: buy_now_price ? parseFloat(buy_now_price) : null,
        end_time: new Date(end_time),
        auto_extend_enabled: !!auto_extend_enabled,
        seller_id: sellerId,
        category_id: parseInt(category_id),
        main_image_url: images[0],
        status: "active",

        images: {
          create: images.map((url) => ({ image_url: url })),
        },
      },
    });

    return res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;
    const userId = req.auth.userId;

    // 1. Find the product
    const product = await prisma.product.findUnique({
      where: { product_id: parseInt(id) },
    });

    if (!product) return res.status(404).json({ message: "Product not found" });

    // 2. Check Ownership
    if (product.seller_id !== userId) {
      return res
        .status(403)
        .json({ message: "You are not the seller of this product" });
    }

    // 3. Append Logic
    const timestamp = new Date().toLocaleString();
    const appendContent = `
            <div class="append-section" style="margin-top: 20px; border-top: 1px dashed #ccc; padding-top: 10px;">
                <p><strong>📅 Update ${timestamp}:</strong></p>
                ${description}
            </div>
        `;

    const finalDescription = product.description + appendContent;

    // 4. Update DB
    const updated = await prisma.product.update({
      where: { product_id: parseInt(id) },
      data: {
        description: finalDescription,
      },
    });

    res
      .status(200)
      .json({ message: "Description updated successfully", product: updated });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getSellerProducts = async (req, res) => {
  try {
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const sellerId = req.auth.userId;
    const products = await productService.getProductsBySellerId(sellerId);

    return res.status(200).json(products);
  } catch (error) {
    console.error("Get Seller Products Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const rejectBidder = async (req, res) => {
  try {
    const { id } = req.params;
    const { bidderId } = req.body;
    const sellerId = req.auth.userId;

    const result = await productService.rejectBidder(sellerId, id, bidderId);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const postQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.auth.userId;

    const question = await productService.addQuestion(userId, id, content);
    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const answerQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { answer } = req.body;
    const sellerId = req.auth.userId;

    const updated = await productService.answerQuestion(
      sellerId,
      questionId,
      answer
    );
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getQuestions = async (req, res) => {
  try {
    const { id } = req.params;
    const questions = await productService.getProductQuestions(id);
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.auth.userId;

    await productService.cancelTransaction(sellerId, id);

    res
      .status(200)
      .json({ message: "Transaction cancelled and user rated -1." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAuctionStats = async (req, res) => {
  try {
    const stats = await productService.getAuctionStats();
    res.status(200).json(stats);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to fetch auction stats" });
  }
};

const getFeatured = async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const products = await productService.getFeaturedProducts(limit);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOngoing = async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const products = await productService.getOngoingProducts(limit);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCompetitive = async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const products = await productService.getCompetitiveProducts(limit);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyPurchases = async (req, res) => {
  try {
    if (!req.auth || !req.auth.userId)
      return res.status(401).json({ message: "Unauthorized" });
    const products = await productService.getUserPurchases(req.auth.userId);
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const getMyActiveBids = async (req, res) => {
  try {
    if (!req.auth || !req.auth.userId)
      return res.status(401).json({ message: "Unauthorized" });
    const products = await productService.getUserActiveBids(req.auth.userId);
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const payForProduct = async (req, res) => {
  try {
    if (!req.auth || !req.auth.userId)
      return res.status(401).json({ message: "Unauthorized" });
    const { id } = req.params;
    const shippingData = req.body;

    const transaction = await productService.createTransaction(
      req.auth.userId,
      id,
      shippingData
    );
    res.status(201).json({ message: "Payment successful", transaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const getReplacement = async (req, res) => {
  try {
    const { excludeIds, categoryId } = req.query;
    let ids = [];
    if (excludeIds) {
      ids = excludeIds.split(",").map((s) => s.trim());
    }

    const product = await productService.getReplacementProduct(ids, categoryId);

    if (!product) {
      return res.status(404).json({ message: "No replacement available" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const placeBid = async (req, res) => {
  try {
    const { id } = req.params;
    // Accept isAutoBid flag, and amount/maxAmount/max_amount (for compatibility)
    const { amount, maxAmount, max_amount, isAutoBid } = req.body;
    const userId = req.auth.userId;

    // Determine the actual amount value (Manual Amount or Auto Max Amount)
    const finalAmount = isAutoBid ? (maxAmount || max_amount || amount) : amount;

    if (!finalAmount) {
      return res.status(400).json({ message: "Bid amount is required" });
    }

    // Call service with flag
    const result = await productService.placeBid(userId, id, finalAmount, !!isAutoBid);

    res.status(201).json(result);
  } catch (error) {
    console.error("Bid Error:", error.message);
    res.status(400).json({ message: error.message });
  }
};

const getHero = async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const products = await productService.getRandomProducts(limit);
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  getProducts,
  getProductDetail,
  createProduct,
  updateProduct,
  getSellerProducts,
  rejectBidder,
  postQuestion,
  answerQuestion,
  getQuestions,
  cancelTransaction,
  getAuctionStats,
  getFeatured,
  getOngoing,
  getCompetitive,
  getReplacement,
  getMyPurchases,
  getMyActiveBids,
  payForProduct,
  placeBid,
  getHero,
};

import express from "express";
import productController from "../controllers/productController.js";
import requireRole from "../middlewares/requireRole.js";

const router = express.Router();

// Public Routes
router.get('/', productController.getProducts);
router.get('/hero', productController.getHero);
router.get('/featured', productController.getFeatured);
router.get('/ongoing', productController.getOngoing);
router.get('/competitive', productController.getCompetitive);
router.get('/replacement', productController.getReplacement);

// Product Detail & Q&A
router.get('/:id', productController.getProductDetail);
router.get("/:id/questions", productController.getQuestions);

// User / Bidder
router.get('/user/purchases', productController.getMyPurchases);
router.get('/user/active-bids', productController.getMyActiveBids);
router.post('/user/purchases/:id/pay', productController.payForProduct);
router.post("/:id/bid", requireRole("bidder"), productController.placeBid);
router.post("/:id/bid/auto", requireRole("bidder"), productController.placeAutoBid);

// Q&A
router.post("/:id/questions", productController.postQuestion);
router.post("/questions/:questionId/reply", productController.answerQuestion);

// Seller
router.get('/seller/me', productController.getSellerProducts);
router.post('/', productController.createProduct);
router.patch('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct); 
router.post("/:id/reject", productController.rejectBidder);
router.post("/:id/cancel", productController.cancelTransaction);

// Admin
router.get("/admin/stats", requireRole("admin"), productController.getAuctionStats);

export default router;
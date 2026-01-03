import express from "express";
import productController from "../controllers/productController.js";
import requireRole from "../middlewares/requireRole.js";

const router = express.Router();

// Search & Listings
router.get('/', productController.getProducts);
router.get('/featured', productController.getFeatured);
router.get('/ongoing', productController.getOngoing);
router.get('/competitive', productController.getCompetitive);
router.get('/replacement', productController.getReplacement);

// Product Detail & Q&A (Read-only)
router.get('/:id', productController.getProductDetail);
router.get("/:id/questions", productController.getQuestions);

// User / Bidder Features
router.get('/user/purchases', productController.getMyPurchases);
router.get('/user/active-bids', productController.getMyActiveBids);
router.post('/user/purchases/:id/pay', productController.payForProduct);

// Bidding (Bidders Only)
router.post("/:id/bid", requireRole("bidder"), productController.placeBid);

// Q&A (Asking & Replying)
router.post("/:id/questions", productController.postQuestion); 
router.post("/questions/:questionId/reply", productController.answerQuestion); 

router.get('/seller/me', productController.getSellerProducts);
router.post('/', productController.createProduct);      
router.patch('/:id', productController.updateProduct);  
router.post("/:id/reject", productController.rejectBidder);
router.post("/:id/cancel", productController.cancelTransaction);

router.get(
  "/admin/stats",
  requireRole("admin"),
  productController.getAuctionStats
);

export default router;
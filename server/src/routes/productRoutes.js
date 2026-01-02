import express from 'express';
import productController from '../controllers/productController.js';

const router = express.Router();

// Public Routes
router.get('/featured', productController.getFeatured);
router.get('/ongoing', productController.getOngoing);
router.get('/competitive', productController.getCompetitive);
router.get('/replacement', productController.getReplacement);
router.get('/user/purchases', productController.getMyPurchases);
router.get('/user/active-bids', productController.getMyActiveBids);
router.post('/user/purchases/:id/pay', productController.payForProduct);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductDetail);

// Protected Routes (Order matters! Put specific paths BEFORE :id)
router.get('/seller/me', productController.getSellerProducts);
router.post('/', productController.createProduct);
router.patch('/:id', productController.updateProduct);

// TASK 3.3: REJECT
router.post('/:id/reject', productController.rejectBidder);

// TASK 3.4: Q&A
router.get('/:id/questions', productController.getQuestions);
router.post('/:id/questions', productController.postQuestion); // Ask
router.post('/questions/:questionId/reply', productController.answerQuestion); // Reply (Note: unique path)

router.post('/:id/cancel', productController.cancelTransaction);

export default router;
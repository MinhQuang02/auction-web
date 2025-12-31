import express from 'express';
import productController from '../controllers/productController.js';

const router = express.Router();

// Public Routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductDetail);

// Protected Routes (Order matters! Put specific paths BEFORE :id)
router.get('/seller/me', productController.getSellerProducts); 
router.post('/', productController.createProduct);
router.patch('/:id', productController.updateProduct);

export default router;
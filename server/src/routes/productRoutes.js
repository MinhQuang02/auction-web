import express from 'express';
import productController from '../controllers/productController.js';

const router = express.Router();

router.get('/', productController.getProducts);       // Search & List
router.get('/:id', productController.getProductDetail); // Detail View

export default router;
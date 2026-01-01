import express from 'express';
import ratingController from '../controllers/ratingController.js';
import requireRole from '../middlewares/requireRole.js'; 

const router = express.Router();
router.post('/', requireRole('seller'), ratingController.postRating);

export default router;
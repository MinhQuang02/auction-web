import express from 'express';
import ratingController from '../controllers/ratingController.js';
import requireRole from '../middlewares/requireRole.js';

const router = express.Router();

router.post('/', requireRole('bidder', 'seller'), ratingController.postRating);
router.get('/my-reviews', requireRole('bidder', 'seller', 'admin'), ratingController.getReviews);
router.get('/user/:userId', ratingController.getPublicReviews);

export default router;
import express from 'express';
import ratingController from '../controllers/ratingController.js';
import requireRole from '../middlewares/requireRole.js';

const router = express.Router();
router.post('/', requireRole('bidder', 'seller'), ratingController.postRating);
// Allow both bidders and sellers to view their reviews (assuming bidders can be reviewed too, or at least sellers)
// Since profile is for everyone, let's allow 'bidder' which usually encompasses basic user rights (or 'seller' if strictly seller reviews).
// The user prompt implies "My Reviews" section. Let's assume any authenticated user might have reviews (though mostly sellers).
router.get('/my-reviews', requireRole('bidder', 'seller', 'admin'), ratingController.getReviews);

export default router;
import express from 'express';
import ratingController from '../controllers/ratingController.js';
// ✅ FIX: Remove curly braces because it is a "default" export
import requireRole from '../middlewares/requireRole.js'; 

const router = express.Router();

// Only Sellers should be rating winners manually (for now)
// You can add requireRole('seller') here to be safe
router.post('/', requireRole('seller'), ratingController.postRating);

export default router;
import express from 'express';
const router = express.Router();
import watchlistController from '../controllers/watchlistController.js';

import requireRole from '../middlewares/requireRole.js';

router.get('/', requireRole('bidder', 'seller', 'admin'), watchlistController.getWatchlist);
router.post('/', requireRole('bidder', 'seller', 'admin'), watchlistController.addToWatchlist);
router.delete('/:id', requireRole('bidder', 'seller', 'admin'), watchlistController.removeWatchlist);

export default router;

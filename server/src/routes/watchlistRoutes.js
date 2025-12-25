import express from 'express';
const router = express.Router();
import watchlistController from '../controllers/watchlistController.js';

router.get('/', watchlistController.getWatchlist);
router.delete('/:id', watchlistController.removeWatchlist);

export default router;

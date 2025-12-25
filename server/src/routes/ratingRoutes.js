import express from 'express';
const router = express.Router();
import ratingController from '../controllers/ratingController.js';

router.get('/', ratingController.getRatings);

export default router;

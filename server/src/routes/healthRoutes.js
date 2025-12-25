import express from 'express';
const router = express.Router();
import healthController from '../controllers/healthController.js';

router.get('/check_health', healthController.checkHealth);

export default router;

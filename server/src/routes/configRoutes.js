import express from 'express';
import configController from '../controllers/configController.js';

const router = express.Router();

router.get('/', configController.getConfig);

export default router;

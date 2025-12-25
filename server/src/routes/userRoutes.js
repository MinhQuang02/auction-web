import express from 'express';
const router = express.Router();
import userController from '../controllers/userController.js';

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

export default router;

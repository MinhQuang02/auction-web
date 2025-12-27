import express from 'express';
import userController from '../controllers/userController.js';
import authenticateToken from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', userController.register);
router.post('/verify', userController.verify);
router.post('/login', userController.login);

router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, userController.updateProfile);

export default router;
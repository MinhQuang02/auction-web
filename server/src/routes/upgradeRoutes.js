import express from 'express';
const router = express.Router();
import upgradeController from '../controllers/upgradeController.js';

router.post('/', upgradeController.requestUpgrade);
router.get('/', upgradeController.getRequests);

export default router;

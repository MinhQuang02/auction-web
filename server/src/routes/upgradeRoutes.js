import express from "express";
import upgradeController from "../controllers/upgradeController.js";
import requireRole from "../middlewares/requireRole.js"; // Ensure you have this

const router = express.Router();

// User requests upgrade
router.post("/request", upgradeController.requestUpgrade);

// Admin routes (Protected)
router.get("/pending", requireRole("admin"), upgradeController.getRequests);
router.post("/approve", requireRole("admin"), upgradeController.approveUpgrade);
router.post("/reject", requireRole("admin"), upgradeController.rejectUpgrade);

export default router;

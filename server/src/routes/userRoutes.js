import express from "express";
const router = express.Router();
import userController from "../controllers/userController.js";
import requireRole from "../middleware/requireRole.js";

router.get("/profile", requireRole("bidder"), userController.getProfile);
router.put("/profile", requireRole("bidder"), userController.updateProfile);

export default router;

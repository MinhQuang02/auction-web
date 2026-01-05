import express from "express";
import adminUserController from "../controllers/adminUserController.js";
import requireRole from "../middlewares/requireRole.js";

const router = express.Router();

router.get("/", adminUserController.getAllUsers);
router.get("/stats", adminUserController.getUserStats);
router.post(
  "/:id/reset-password",
  requireRole("admin"),
  adminUserController.resetUserPassword
);
router.get("/:id", adminUserController.getUserDetail);
router.post("/downgrade", adminUserController.downgradeSeller);
router.post("/suspend", adminUserController.suspendUser);
router.post("/unsuspend", adminUserController.unsuspendUser);
router.post("/", adminUserController.createUser);
router.patch(
  "/:id/profile",
  requireRole("admin"),
  adminUserController.updateUserProfile
);

export default router;

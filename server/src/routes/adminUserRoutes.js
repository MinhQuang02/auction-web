import express from "express";
import adminUserController from "../controllers/adminUserController.js";

const router = express.Router();

router.get("/", adminUserController.getAllUsers);
router.get("/stats", adminUserController.getUserStats);
router.get("/:id", adminUserController.getUserDetail);

export default router;

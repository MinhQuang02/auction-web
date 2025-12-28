import { Router } from "express";
import authController from "../controllers/authController.js";

const router = new Router();

router.post("/register", authController.register);
router.post("/verify-email", authController.verifyEmail);
router.post("/login", authController.login);
router.post("/google", authController.google);
router.get("/me", authController.me);

export default router;

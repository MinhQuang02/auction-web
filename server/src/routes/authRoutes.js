import { Router } from "express";
import authController from "../controllers/authController.js";

const router = new Router();

router.post("/register", authController.register);
router.post("/login", authController.login);

export default router;

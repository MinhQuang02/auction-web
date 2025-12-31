import express from "express";
import productAdminController from "../controllers/adminProductController.js";

const router = express.Router();

router.post("/", productAdminController.createProduct);
router.put("/:id", productAdminController.updateProduct);
router.delete("/:id", productAdminController.deleteProduct);

export default router;

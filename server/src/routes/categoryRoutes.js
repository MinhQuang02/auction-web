import express from "express";
import categoryController from "../controllers/categoryController.js";
import requireRole from "../middlewares/requireRole.js";

const router = express.Router();

router.get("/", categoryController.getCategories);
router.get("/subcategory", categoryController.getSubCategories);

router.get("/:id", categoryController.getCategory);
router.post("/", requireRole("admin"), categoryController.createCategory);
router.put("/:id", requireRole("admin"), categoryController.updateCategory);
router.delete("/:id", requireRole("admin"), categoryController.deleteCategory);

export default router;
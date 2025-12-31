import categoryService from "../services/categoryService.js";

/* READ */
const getCategories = async (req, res) => {
  try {
    const data = await categoryService.getCategoryTree();
    console.log(data);
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* CREATE */
const createCategory = async (req, res) => {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json(category);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

/* UPDATE */
const updateCategory = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const category = await categoryService.updateCategory(id, req.body);
    res.json(category);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

/* DELETE */
const deleteCategory = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await categoryService.deleteCategory(id);
    res.status(204).end();
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
};

export default {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};

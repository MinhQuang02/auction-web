import productService from "../services/productService.js";

const createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.updateProduct(id, req.body);
    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await productService.deleteProduct(id);
    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

export default {
  createProduct,
  updateProduct,
  deleteProduct,
};

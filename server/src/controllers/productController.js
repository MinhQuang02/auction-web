import productService from '../services/productService.js';

const getProducts = async (req, res) => {
    try {
        const { category_id } = req.query;
        const products = await productService.getProductsByCategory(category_id);
        res.status(200).json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export default {
    getProducts,
};

import productService from '../services/productService.js';

// 1. SEARCH LIST (With "New" Badge)
const getProducts = async (req, res) => {
    try {
        const { keyword, category_id, sort_by, limit, offset } = req.query;

        const products = await productService.searchProducts({
            keyword,
            categoryId: category_id,
            sortBy: sort_by,
            limit,
            offset
        });

        // "New" Badge Logic (Req 1.4)
        // Mark as new if posted within the last 60 minutes (adjust as needed)
        const NEW_THRESHOLD_MINUTES = 60;
        const now = new Date();

        const productsWithBadge = products.map(p => {
            const postTime = new Date(p.start_time);
            const diffMs = now - postTime;
            const diffMins = Math.floor(diffMs / 60000);

            return {
                ...p,
                is_new: diffMins <= NEW_THRESHOLD_MINUTES
            };
        });

        res.status(200).json(productsWithBadge);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// 2. PRODUCT DETAIL (With Related Items)
const getProductDetail = async (req, res) => {
    try {
        const { id } = req.params;
        
        const product = await productService.getProductById(id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Fetch related products
        const related = await productService.getRelatedProducts(id, product.category_id);

        // Combine response
        res.status(200).json({
            product,
            related_products: related
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export default {
    getProducts,
    getProductDetail
};
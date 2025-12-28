import categoryService from '../services/categoryService.js';

const getCategories = async (req, res) => {
    try {
        const categories = await categoryService.getCategoryTree();
        res.status(200).json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export default { getCategories };
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const getProductsByCategory = async (categoryId) => {
    const where = {
        status: 'active',
    };

    if (categoryId) {
        where.category_id = parseInt(categoryId);
    }

    const products = await prisma.product.findMany({
        where: where,
        orderBy: {
            start_time: 'desc'
        }
    });
    return products;
};

export default {
    getProductsByCategory,
};

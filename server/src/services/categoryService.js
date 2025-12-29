import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const getCategoryTree = async () => {
    return await prisma.category.findMany({
        where: {
            parent_id: null
        },
        include: {
            children: {
                select: {
                    category_id: true,
                    name: true
                    // If you need 3rd level, add include: { children: true } here
                }
            }
        }
    });
};

export default {
    getCategoryTree
};
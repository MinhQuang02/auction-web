import prisma from "../lib/prisma.js";

// 1. Get Full Tree (For Sidebar / Home)
const getCategoryTree = async () => {
  return await prisma.category.findMany({
    where: { parent_id: null },
    include: {
      children: {
        include: {
           _count: { select: { products: true } },
           children: { 
             include: { _count: { select: { products: true } } }
           }
        }
      },
      _count: { select: { products: true } }
    },
    orderBy: { name: 'asc' }
  });
};

// 2. Get Sub-Categories Only (For Dropdowns)
const getSubCategories = async () => {
  return await prisma.category.findMany({
    where: {
      parent_id: { not: null }, 
    },
    select: {
      category_id: true,
      name: true,
      parent_id: true,
    },
    orderBy: { name: 'asc' }
  });
};

// 3. Get Single Category
const getCategoryById = async (id) => {
  const idInt = parseInt(id);
  if (isNaN(idInt)) return null;

  return await prisma.category.findUnique({
    where: { category_id: idInt },
    include: {
      parent: true,
      children: true
    }
  });
};

// 4. Get Category + All Child IDs
const getCategoryAndDescendants = async (categoryId) => {
  const startId = parseInt(categoryId);
  if (isNaN(startId)) return [];

  let ids = [startId];
  let queue = [startId];

  while (queue.length > 0) {
    const currentId = queue.shift();
    
    const children = await prisma.category.findMany({
      where: { parent_id: currentId },
      select: { category_id: true }
    });

    for (const child of children) {
      ids.push(child.category_id);
      queue.push(child.category_id);
    }
  }

  return ids;
};

// 5. Admin Operations
const createCategory = async (data) => {
  return await prisma.category.create({
    data: {
      name: data.name,
      parent_id: data.parent_id ? parseInt(data.parent_id) : null
    }
  });
};

const updateCategory = async (id, data) => {
  return await prisma.category.update({
    where: { category_id: parseInt(id) },
    data: {
      name: data.name,
      parent_id: data.parent_id ? parseInt(data.parent_id) : null
    }
  });
};

const deleteCategory = async (id) => {
  const categoryId = parseInt(id);

  const productCount = await prisma.product.count({
    where: { category_id: categoryId }
  });
  if (productCount > 0) throw new Error("Cannot delete category containing products");

  const childCount = await prisma.category.count({
    where: { parent_id: categoryId }
  });
  if (childCount > 0) throw new Error("Cannot delete parent category. Remove sub-categories first.");

  return await prisma.category.delete({
    where: { category_id: categoryId }
  });
};

export default {
  getCategoryTree,
  getSubCategories,
  getCategoryById,
  getCategoryAndDescendants,
  createCategory,
  updateCategory,
  deleteCategory,
};
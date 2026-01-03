import prisma from "../lib/prisma.js";

const getCategoryTree = async () => {
  return prisma.category.findMany({
    where: { parent_id: null },
    include: {
      _count: {
        select: {
          products: true,
          children: true,
        },
      },
      children: {
        include: {
          _count: {
            select: {
              products: true,
              children: true,
            },
          },
          children: {
            include: {
              _count: {
                select: {
                  products: true,
                  children: true,
                },
              },
            },
          },
        },
      },
    },
  });
};

const getSubCategories = async () => {
  return prisma.category.findMany({
    where: {
      parent_id: { not: null },
    },
    select: {
      category_id: true,
      name: true,
      url_icon: true,
      parent_id: true,
    },
  });
};

const getCategoryById = async (id) => {
  return prisma.category.findUnique({
    where: { category_id: id },
    include: {
      children: true,
      parent: true,
    },
  });
};

const getCategoryAndDescendants = async (categoryId) => {
  const ids = [];
  const stack = [parseInt(categoryId)];

  while (stack.length > 0) {
    const currentId = stack.pop();
    ids.push(currentId);

    const children = await prisma.category.findMany({
      where: { parent_id: currentId },
      select: { category_id: true },
    });

    for (const child of children) {
      stack.push(child.category_id);
    }
  }

  return ids;
};

const createCategory = async ({ name, parent_id }) => {
  if (!name?.trim()) {
    throw new Error("Category name is required");
  }

  if (parent_id) {
    const parent = await prisma.category.findUnique({
      where: { category_id: parent_id },
    });

    if (!parent) {
      throw new Error("Parent category does not exist");
    }
  }

  return prisma.category.create({
    data: { name, parent_id },
  });
};

const updateCategory = async (id, { name, parent_id }) => {
  const category = await prisma.category.findUnique({
    where: { category_id: id },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  if (parent_id === id) {
    throw new Error("Category cannot be its own parent");
  }

  if (parent_id) {
    let current = parent_id;

    while (current) {
      if (current === id) {
        throw new Error("Cannot move category under its own descendant");
      }

      const parent = await prisma.category.findUnique({
        where: { category_id: current },
        select: { parent_id: true },
      });

      current = parent?.parent_id;
    }
  }

  return prisma.category.update({
    where: { category_id: id },
    data: {
      name: name ?? category.name,
      parent_id,
    },
  });
};

const deleteCategory = async (id) => {
  const category = await prisma.category.findUnique({
    where: { category_id: id },
    include: {
      children: true,
      products: true,
    },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  if (category.children.length > 0) {
    throw new Error("Category has subcategories");
  }

  if (category.products.length > 0) {
    throw new Error("Category has products");
  }

  return prisma.category.delete({
    where: { category_id: id },
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

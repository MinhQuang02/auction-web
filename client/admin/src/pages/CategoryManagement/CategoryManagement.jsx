import { useState, useEffect } from "react";

import VBox from "@/components/VBox";
import HBox from "@/components/HBox";
import AdminSidebar from "@/components/Sidebar/AdminSidebar";
import ActionBar from "@/components/ActionBar";
import HierarchyPanel from "./HierarchyPanel";
import CategoryDetailsPanel from "./CategoryDetailsPanel";

const categories = [
  {
    id: "electronics",
    label: "Electronics",
    path: "/electronics",
    product_count: 120,
    active: true,
    description: "All kinds of electronic devices",
    children: [
      {
        id: "tablets",
        label: "Tablets",
        path: "/electronics/tablets",
        product_count: 35,
        active: true,
        description: "Tablets and iPads",
      },
      {
        id: "laptops",
        label: "Laptops",
        path: "/electronics/laptops",
        product_count: 45,
        active: true,
        description: "Laptops for work and gaming",
      },
      {
        id: "phones",
        label: "Phones",
        path: "/electronics/phones",
        product_count: 40,
        active: true,
        description: "Smartphones of all brands",
        children: [
          {
            id: "samsung",
            label: "Samsung",
            path: "/electronics/phones/samsung",
            product_count: 20,
            active: true,
            description: "Samsung Galaxy phones",
          },
          {
            id: "iphone",
            label: "iPhone",
            path: "/electronics/phones/iphone",
            product_count: 20,
            active: true,
            description: "Apple iPhones",
          },
        ],
      },
    ],
  },
  {
    id: "health-beauty",
    label: "Health & Beauty",
    path: "/health-beauty",
    product_count: 80,
    active: true,
    description: "Products for personal care and wellness",
    children: [
      {
        id: "skincare",
        label: "Skincare",
        path: "/health-beauty/skincare",
        product_count: 30,
        active: true,
        description: "Lotions, creams, and serums",
      },
      {
        id: "makeup",
        label: "Makeup",
        path: "/health-beauty/makeup",
        product_count: 25,
        active: true,
        description: "Cosmetics and beauty products",
      },
      {
        id: "personal-care",
        label: "Personal Care",
        path: "/health-beauty/personal-care",
        product_count: 25,
        active: true,
        description: "Hygiene and daily care items",
      },
    ],
  },
  {
    id: "home-garden",
    label: "Home & Garden",
    path: "/home-garden",
    product_count: 50,
    active: true,
    description: "Furniture, kitchenware, and gardening",
    children: [
      {
        id: "kitchen",
        label: "Kitchen",
        path: "/home-garden/kitchen",
        product_count: 20,
        active: true,
        description: "Kitchen appliances and utensils",
      },
      {
        id: "furniture",
        label: "Furniture",
        path: "/home-garden/furniture",
        product_count: 30,
        active: true,
        description: "Chairs, tables, and storage",
      },
    ],
  },
];

const flattenCategories = (items) => {
  return items.reduce((acc, item) => {
    acc.push(item);
    if (item.children) acc.push(...flattenCategories(item.children));
    return acc;
  }, []);
};

const allCategories = flattenCategories(categories);

const CategoryManagement = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    if (!selectedId && allCategories.length > 0) {
      setSelectedId(allCategories[0].id);
      setSelectedCategory(allCategories[0]);
    }
  }, [allCategories, selectedId]);

  // Update selectedCategory when selectedId changes
  useEffect(() => {
    const cat = allCategories.find((c) => c.id === selectedId);
    if (cat) setSelectedCategory(cat);
  }, [selectedId, allCategories]);

  return (
    <VBox className="p-10 gap-40">
      <HBox className="gap-10">
        <AdminSidebar />
        <span className="text-6xl font-bold text-black self-center flex-grow">
          CATEGORIES
        </span>
      </HBox>

      <div className="grid grid-cols-[24rem_1fr] gap-4">
        <ActionBar
          onFilter={() => {}}
          onSearch={() => {}}
          onAdd={() => {}}
          onRemove={() => {}}
          onEdit={() => {}}
        />

        <div></div>

        <HierarchyPanel
          data={categories}
          selectedIds={selectedId ? [selectedId] : []}
          onSelect={setSelectedId}
        />

        <CategoryDetailsPanel {...selectedCategory} />
      </div>
    </VBox>
  );
};

export default CategoryManagement;

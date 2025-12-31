import { useState, useEffect, useMemo } from "react";

import VBox from "@components/VBox";
import HBox from "@components/HBox";
import AdminSidebar from "@components/Sidebar/AdminSidebar";
import ActionBar from "@components/ActionBar";
import HierarchyPanel from "./HierarchyPanel";
import CategoryDetailsPanel from "./CategoryDetailsPanel";

const API_URL = import.meta.env.VITE_API_URL;

const slugify = (str) => str.toLowerCase().trim().replace(/\s+/g, "-");

const normalizeCategory = (cat, parentPath = "") => {
  const slug = slugify(cat.name);
  const path = parentPath ? `${parentPath}/${slug}` : `/${slug}`;

  return {
    id: cat.category_id,
    label: cat.name,
    path,
    product_count: cat.product_count ?? 0,
    children:
      cat.children?.map((child) => normalizeCategory(child, path)) ?? [],
  };
};

const flattenCategories = (items) =>
  items.reduce((acc, item) => {
    acc.push(item);
    if (item.children?.length) {
      acc.push(...flattenCategories(item.children));
    }
    return acc;
  }, []);

const filterTree = (nodes, searchQuery, parentsOnly) => {
  const query = searchQuery.toLowerCase().trim();

  return nodes
    .map((node) => {
      const labelMatch = node.label.toLowerCase().includes(query);

      const filteredChildren = node.children
        ? filterTree(node.children, searchQuery, parentsOnly)
        : [];

      const shouldInclude =
        (!query || labelMatch || filteredChildren.length > 0) &&
        (!parentsOnly || node.children?.length > 0);

      if (!shouldInclude) return null;

      return {
        ...node,
        children: filteredChildren,
        __autoExpand: Boolean(query),
      };
    })
    .filter(Boolean);
};

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [showParentsOnly, setShowParentsOnly] = useState(false);

  const filteredCategories = useMemo(
    () => filterTree(categories, searchQuery, showParentsOnly),
    [categories, searchQuery, showParentsOnly]
  );

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch categories");
        return res.json();
      })
      .then((data) => {
        const normalized = data.map(normalizeCategory);
        setCategories(normalized);
        if (normalized.length > 0) {
          setSelectedId(normalized[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const allCategories = useMemo(
    () => flattenCategories(categories),
    [categories]
  );

  const selectedCategory = useMemo(
    () => allCategories.find((c) => c.id === selectedId),
    [allCategories, selectedId]
  );

  if (loading) {
    return <div className="p-10">Loading categories…</div>;
  }

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
          onFilter={() => setShowParentsOnly((v) => !v)}
          onSearch={(value) => setSearchQuery(value)}
          onAdd={() => {}}
          onRemove={() => {}}
          onEdit={() => {}}
        />

        <div />

        <HierarchyPanel
          data={filteredCategories}
          selectedIds={selectedId ? [selectedId] : []}
          onSelect={setSelectedId}
        />

        {selectedCategory && (
          <CategoryDetailsPanel category={selectedCategory} />
        )}
      </div>
    </VBox>
  );
};

export default CategoryManagement;

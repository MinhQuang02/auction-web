import { useState, useEffect, useMemo } from "react";

import VBox from "@components/VBox";
import HBox from "@components/HBox";
import Panel from "@components/Panel";
import Modal from "@components/Modal";
import AdminSidebar from "@components/Sidebar/AdminSidebar";
import ActionBar from "@components/ActionBar";
import HierarchyPanel from "./HierarchyPanel";
import CategoryDetailsPanel from "./CategoryDetailsPanel";
import CategoryModalContent from "./CategoryModalContent";

const API_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("token");

const slugify = (str) => str.toLowerCase().trim().replace(/\s+/g, "-");

const normalizeCategory = (cat, parentPath = "") => {
  const slug = slugify(cat.name);
  const path = parentPath ? `${parentPath}/${slug}` : `/${slug}`;

  return {
    id: cat.category_id,
    label: cat.name,
    path,
    product_count: cat._count?.products ?? 0,
    parent_id: cat.parent_id ?? null,
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

  const [modalMode, setModalMode] = useState(null); // "add" / "edit" / "delete"

  const fetchCategories = async () => {
    const res = await fetch(`${API_URL}/api/categories`);
    if (!res.ok) throw new Error("Failed to fetch categories");
    const data = await res.json();
    const normalized = data.map((cat) => normalizeCategory(cat));
    setCategories(normalized);
    if (!selectedId && normalized.length > 0) {
      setSelectedId(normalized[0].id);
    }
  };

  useEffect(() => {
    fetchCategories()
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredCategories = useMemo(
    () => filterTree(categories, searchQuery, showParentsOnly),
    [categories, searchQuery, showParentsOnly]
  );

  const allCategories = useMemo(
    () => flattenCategories(categories),
    [categories]
  );

  const selectedCategory = useMemo(
    () => allCategories.find((c) => c.id === selectedId),
    [allCategories, selectedId]
  );

  const addCategory = async ({ name, parent_id }) => {
    const res = await fetch(`${API_URL}/api/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, parent_id }),
    });
    await fetchCategories();
  };

  const editCategory = async (id, updates) => {
    await fetch(`${API_URL}/api/categories/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
    await fetchCategories();
  };

  const deleteCategory = async (id) => {
    const res = await fetch(`${API_URL}/api/categories/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to delete category");
    }

    await fetchCategories();
    setSelectedId(null);
  };

  const canDeleteCategory = (category) => {
    if (!category) return false;

    const hasChildren = category.children?.length > 0;
    const hasProducts = (category.product_count ?? 0) > 0;

    return !hasChildren && !hasProducts;
  };

  if (loading) {
    return <div className="p-10">Loading categories…</div>;
  }

  return (
    <VBox className="p-10 gap-40">
      <HBox className="gap-10">
        <AdminSidebar />
        <span className="text-6xl font-bold text-black flex-grow">
          CATEGORIES
        </span>
      </HBox>

      <div className="grid grid-cols-[32rem_1fr] gap-4">
        <ActionBar
          onFilter={() => setShowParentsOnly((v) => !v)}
          onSearch={(value) => setSearchQuery(value)}
          onAdd={() => setModalMode("add")}
          onEdit={() => setModalMode("edit")}
          onRemove={() => setModalMode("delete")}
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

      <Modal isOpen={Boolean(modalMode)} onClose={() => setModalMode(null)}>
        {modalMode && (
          <CategoryModalContent
            mode={modalMode}
            category={
              modalMode === "edit" || modalMode === "delete"
                ? selectedCategory
                : null
            }
            defaultParent={modalMode === "add" ? selectedCategory : null}
            categories={allCategories}
            canDeleteCategory={canDeleteCategory}
            onCancel={() => setModalMode(null)}
            onConfirm={async (payload) => {
              try {
                if (modalMode === "add") await addCategory(payload);
                if (modalMode === "edit")
                  await editCategory(selectedCategory.id, payload);
                if (modalMode === "delete")
                  await deleteCategory(selectedCategory.id);

                setModalMode(null); // close ONLY on success
              } catch (e) {
                alert(e.message); // or toast
              }
            }}
          />
        )}
      </Modal>
    </VBox>
  );
};

export default CategoryManagement;

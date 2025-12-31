import { useState, useEffect } from "react";
import HBox from "@components/HBox";
import VBox from "@components/VBox";

const CategoryModalContent = ({
  mode,
  category,
  defaultParent,
  categories,
  canDeleteCategory,
  onCancel,
  onConfirm,
}) => {
  const [name, setName] = useState(
    mode === "edit" ? category?.label ?? "" : ""
  );

  const [parentId, setParentId] = useState(
    mode === "edit" ? category?.parent_id ?? "" : defaultParent?.id ?? ""
  );

  useEffect(() => {
    if (mode === "edit") {
      setName(category?.label ?? "");
      setParentId(category?.parent_id ?? "");
    } else if (mode === "add") {
      setName("");
      setParentId(defaultParent?.id ?? "");
    }
  }, [mode, category, defaultParent]);

  if ((mode === "edit" || mode === "delete") && !category) {
    return (
      <VBox className="gap-4">
        <h2 className="text-2xl font-semibold">No category selected</h2>
        <p>Please select a category first.</p>
        <HBox className="justify-end pt-4">
          <button onClick={onCancel}>Close</button>
        </HBox>
      </VBox>
    );
  }

  if (mode === "delete" && !canDeleteCategory(category)) {
    const hasChildren = category.children?.length > 0;
    const hasProducts = (category.product_count ?? 0) > 0;

    return (
      <VBox className="gap-4">
        <h2 className="text-2xl font-semibold text-red-600">
          Cannot delete category
        </h2>

        {hasChildren && (
          <p>This category has subcategories. Remove them first.</p>
        )}

        {hasProducts && (
          <p>This category contains products. Move or delete them first.</p>
        )}

        <HBox className="justify-end pt-4">
          <button onClick={onCancel}>Close</button>
        </HBox>
      </VBox>
    );
  }

  if (mode === "delete" && category && canDeleteCategory(category)) {
    return (
      <>
        <p className="mb-6 text-lg">
          Delete <b>{category.label}</b>? This cannot be undone.
        </p>

        <HBox className="gap-4 justify-end">
          <button onClick={onCancel}>Cancel</button>
          <button
            className="bg-red-600 text-white px-4 py-2 rounded"
            onClick={() => onConfirm()}
          >
            Delete
          </button>
        </HBox>
      </>
    );
  }

  return (
    <VBox className="gap-4">
      <h2 className="text-2xl font-semibold">
        {mode === "add" ? "Add Category" : "Edit Category"}
      </h2>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Category name"
        className="border p-2 rounded"
      />

      <select
        className="border p-2 rounded"
        value={parentId ?? ""}
        onChange={(e) => setParentId(e.target.value || null)}
      >
        <option value="">No parent</option>
        {categories
          .filter((c) => mode !== "edit" || c.id !== category?.id)
          .map((c) => (
            <option key={c.id} value={c.id}>
              {c.path}
            </option>
          ))}
      </select>

      <HBox className="gap-4 justify-end pt-4">
        <button onClick={onCancel}>Cancel</button>
        <button
          className="bg-primary text-white px-4 py-2 rounded"
          onClick={() =>
            onConfirm({
              name,
              parent_id: parentId ? Number(parentId) : null,
            })
          }
        >
          {mode === "add" ? "Add" : "Save"}
        </button>
      </HBox>
    </VBox>
  );
};

export default CategoryModalContent;

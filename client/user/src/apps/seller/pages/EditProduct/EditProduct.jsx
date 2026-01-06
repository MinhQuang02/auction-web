import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Quill from "quill";
import { useToast } from "../../../../components/ui/Toast";
import axios from "axios";

import Panel from "@shared/components/Panel";
import HBox from "@shared/components/HBox";
import VBox from "@shared/components/VBox";

const API_URL = import.meta.env.VITE_API_URL;

const EditProduct = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { id } = useParams(); // Get ID if editing
  const isEditMode = !!id;

  const quillRef = useRef(null);
  const quillInstance = useRef(null);
  const [categories, setCategories] = useState([]); // Stores Parent Categories
  const [allSubCategories, setAllSubCategories] = useState([]); // Stores ALL sub-categories
  const [subCategories, setSubCategories] = useState([]); // Stores filtered sub-categories
  const [selectedParentId, setSelectedParentId] = useState(""); // UI State for Parent Select

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    startPrice: "",
    stepPrice: "",
    buyNowPrice: "",
    endTime: "",
    autoExtend: false,
    images: [], // We will just store URLs here. UI will show "add" slots.
  });

  const [oldDescription, setOldDescription] = useState("");
  const [descriptionContent, setDescriptionContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 1. Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Debug Log: Check if API_URL is correct
        console.log(
          `[EditProduct] Fetching categories from: ${API_URL}/api/categories`
        );

        const res = await fetch(`${API_URL}/api/categories`);

        // Check for HTML response (Wrong URL/Port issue)
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
          throw new Error(
            "Server returned HTML instead of JSON. Check API_URL port."
          );
        }


        const data = await res.json();
        if (Array.isArray(data)) {
          // Flatten if it's a tree, but controller says valid list. 
          // Let's assume it returns a list of all categories including parents and children.
          // IF the response is tree struct (parent -> children), we flatten it or handle it.
          // Based on previous code, let's assume flat list logic or tree.
          // "getCategoryTree" implies tree. Let's handle tree structure.

          let parents = [];
          let subs = [];

          // Helper to process tree if needed OR flat list
          data.forEach(cat => {
            // If it has children, it's a parent (or if parent_id is null)
            // The controller uses `getCategoryTree`.
            // Tree structure usually is: { ...cat, children: [...] }

            parents.push({
              category_id: cat.category_id,
              name: cat.name
            });

            if (cat.children && cat.children.length > 0) {
              cat.children.forEach(child => {
                subs.push({
                  category_id: child.category_id,
                  name: child.name,
                  parent_id: cat.category_id
                });
              });
            }
          });

          setCategories(parents);
          setAllSubCategories(subs);
        }
      } catch (err) {
        // FIX: Added braces and full logging
        console.error("Error loading categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Filter Sub-categories when Parent Changes
  useEffect(() => {
    if (selectedParentId) {
      const filtered = allSubCategories.filter(
        (sub) => sub.parent_id === parseInt(selectedParentId)
      );
      setSubCategories(filtered);
    } else {
      setSubCategories([]);
    }
  }, [selectedParentId, allSubCategories]);

  // 2. Fetch Product Data (Only in Edit Mode)
  useEffect(() => {
    if (!isEditMode) return;

    const fetchProduct = async () => {
      try {
        console.log(`[EditProduct] Fetching product: ${id}`);
        const res = await fetch(`${API_URL}/api/products/${id}`);

        if (!res.ok) throw new Error("Product not found");

        const data = await res.json();
        const p = data.product;

        // Find parent for pre-selection
        // We know p.category_id is the sub-category ID.
        // We need to find which parent has this child.
        // Since we might not have `allSubCategories` populated yet due to async race,
        // we might need to rely on `p.category.parent_id` if the API returns it nested.
        // Let's rely on finding it in our fetched list if possible, or wait.
        // Better: The API usually returns the category object with the product.
        // Let's assume p.category exists and has parent_id.

        let parentId = "";

        if (p.category && p.category.parent_id) {
          parentId = p.category.parent_id;
        } else {
          // Fallback: search in allSubs if available (might be empty here due to race condition)
          // Logic: It's safer if we just set it. We will depend on `allSubCategories` in a separate effect if needed,
          // but `fetchCategories` runs on mount.
        }

        if (parentId) setSelectedParentId(parentId);

        // Pre-fill form
        setFormData({
          name: p.name,
          categoryId: p.category_id,
          startPrice: p.start_price,
          stepPrice: p.step_price,
          buyNowPrice: p.buy_now_price || "",
          endTime: p.end_time ? p.end_time.slice(0, 16) : "",
          autoExtend: p.auto_extend_enabled,
          images: p.images?.map((img) => img.image_url) || [],
        });

        setOldDescription(p.description);
      } catch (err) {
        console.error("Failed to load product:", err);
        setError("Failed to load product details.");
      }
    };
    fetchProduct();
  }, [id, isEditMode]);

  // 3. Quill Logic (Wrapper Pattern)
  useEffect(() => {
    if (!quillRef.current) return;

    // Cleanup container
    quillRef.current.innerHTML = "";

    // Create Wrapper
    const editorContainer = document.createElement("div");
    quillRef.current.appendChild(editorContainer);

    // Initialize Quill
    const quill = new Quill(editorContainer, {
      theme: "snow",
      placeholder: isEditMode
        ? "Write NEW information to append..."
        : "Describe your product...",
      modules: {
        toolbar: [
          [{ header: [1, 2, false] }],
          ["bold", "italic", "underline"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["clean"],
        ],
      },
    });

    quillInstance.current = quill;
    quill.on("text-change", () => {
      setDescriptionContent(quill.root.innerHTML);
    });

    return () => {
      quillInstance.current = null;
      if (quillRef.current) quillRef.current.innerHTML = "";
    };
  }, [isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* ------------------------------------------------------------------
   *  IMAGE UPLOAD LOGIC
   * ------------------------------------------------------------------ */
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(`${API_URL}/api/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.url;
  };

  const handleFileDrop = async (file, index) => {
    if (!file) return;

    try {
      // 1. Upload immediately
      const url = await uploadImage(file);

      // 2. Update State
      setFormData((prev) => {
        const newImages = [...prev.images];
        if (index >= newImages.length) {
          // Add new
          newImages.push(url);
        } else {
          // Replace
          newImages[index] = url;
        }
        return { ...prev, images: newImages };
      });

      addToast("Image uploaded!", "success");
    } catch (e) {
      console.error(e);
      addToast("Upload failed", "error");
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => {
      const newImages = prev.images.filter((_, i) => i !== index);
      return { ...prev, images: newImages };
    });
  };

  const addImageSlot = () => {
    // Just a placeholder action if we were using empty strings, 
    // but with the new logic we just append when uploading.
    // We can trigger a file input click programmatically if needed.
    document.getElementById("hidden-file-input").click();
  };

  // Helper Component for Dropzone
  const ImageBox = ({ url, index, isMain, onDelete }) => {
    const inputRef = useRef(null);

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFileDrop(files[0], index);
      }
    };

    const handleClick = () => inputRef.current?.click();

    return (
      <div
        className={`
          relative flex items-center justify-center 
          bg-gray-50 border-2 border-dashed border-gray-300 
          rounded-xl overflow-hidden cursor-pointer hover:bg-gray-100 transition
          ${isMain ? "h-64 w-full" : "h-32 w-full"}
        `}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files?.[0]) handleFileDrop(e.target.files[0], index);
          }}
        />

        {url ? (
          <>
            <img
              src={url}
              alt="Uploaded"
              className="w-full h-full object-cover"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(index);
              }}
              className="absolute top-2 right-2 bg-white/80 hover:bg-red-100 text-red-600 p-1 rounded-full shadow"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
            {isMain && (
              <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 text-xs rounded">
                Main Image
              </div>
            )}
          </>
        ) : (
          <div className="text-gray-400 text-center p-4">
            <div className="mx-auto mb-2 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </div>
            <span className="text-xs font-medium">
              {isMain ? "Upload Main Image" : "Add Image"}
            </span>
          </div>
        )}
      </div>
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (isEditMode) {
        // --- EDIT MODE (Append Description) ---
        const res = await fetch(`${API_URL}/api/products/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ description: descriptionContent }),
        });

        if (!res.ok) throw new Error("Failed to update description");
        addToast("Description appended successfully!", "success");
      } else {
        // --- CREATE MODE ---
        const validImages = formData.images.filter((img) => img && img.trim() !== "");
        if (validImages.length < 4)
          throw new Error("At least 4 images required");

        const payload = {
          name: formData.name,
          description: descriptionContent,
          category_id: formData.categoryId,
          start_price: formData.startPrice,
          step_price: formData.stepPrice,
          buy_now_price: formData.buyNowPrice || null,
          end_time: formData.endTime,
          auto_extend_enabled: formData.autoExtend,
          images: validImages,
        };

        const res = await fetch(`${API_URL}/api/products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Failed to create");
        addToast("Product created!", "success");
      }

      navigate("/seller/products");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 bg-[#f9f9f9]">
      <HBox className="gap-8 items-start">
        <VBox className="flex-1 gap-8 w-full max-w-4xl mx-auto">
          <HBox>
            <h2 className="text-4xl font-bold">
              {isEditMode ? "Supplement Description" : "Post New Auction"}
            </h2>
          </HBox>

          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>
          )}

          <VBox className="flex-1 gap-4">
            <Panel className="p-6 gap-6 bg-white rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold border-b pb-2">
                1. Basic Information
              </h3>
              <VBox className="gap-4">
                <label className="font-semibold mb-1">Product Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  type="text"
                  disabled={isEditMode}
                  className="p-3 border rounded-xl font-medium outline-none disabled:bg-gray-100 disabled:text-gray-500"
                />
              </VBox>

              <VBox className="gap-4">
                <label className="font-semibold mb-1">
                  {isEditMode
                    ? "New Information (Will be appended)"
                    : "Description"}
                </label>

                {isEditMode && oldDescription && (
                  <div className="mb-4 p-4 bg-gray-50 border rounded-xl">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                      Current Description:
                    </p>
                    <div
                      className="prose prose-sm max-w-none text-gray-600"
                      dangerouslySetInnerHTML={{ __html: oldDescription }}
                    />
                  </div>
                )}

                <div
                  className="bg-white border rounded-xl overflow-hidden"
                  style={{ height: "250px" }}
                >
                  <div ref={quillRef} style={{ height: "200px" }} />
                </div>
              </VBox>
            </Panel>

            {!isEditMode && (
              <>
                <Panel className="p-6 gap-6 bg-white rounded-xl shadow-sm">
                  <h3 className="text-xl font-semibold border-b pb-2">
                    2. Details & Images
                  </h3>
                  <VBox className="gap-4">
                    <label className="font-semibold mb-1">Category</label>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Parent Category Select */}
                      <VBox>
                        <label className="text-xs text-gray-500 mb-1">Main Category</label>
                        <select
                          value={selectedParentId}
                          onChange={(e) => {
                            setSelectedParentId(e.target.value);
                            setFormData(prev => ({ ...prev, categoryId: "" })); // Reset sub-cat
                          }}
                          className="p-3 border rounded-xl bg-white outline-none"
                        >
                          <option value="">Select Main Category</option>
                          {categories.map((cat) => (
                            <option key={cat.category_id} value={cat.category_id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </VBox>

                      {/* Sub Category Select */}
                      <VBox>
                        <label className="text-xs text-gray-500 mb-1">Sub Category</label>
                        <select
                          name="categoryId"
                          value={formData.categoryId}
                          onChange={handleChange}
                          className="p-3 border rounded-xl bg-white focus:ring-2 ring-[#8C7963] outline-none disabled:bg-gray-100"
                          required
                          disabled={!selectedParentId}
                        >
                          <option value="">Select Sub-Category</option>
                          {subCategories.map((sub) => (
                            <option key={sub.category_id} value={sub.category_id}>
                              {sub.name}
                            </option>
                          ))}
                        </select>
                      </VBox>
                    </div>
                  </VBox>
                  <VBox className="gap-4">
                    <label className="font-semibold mb-1">
                      product Images (Min 4)
                    </label>

                    <div className="flex flex-col gap-4">
                      {/* Main Image - Index 0 */}
                      <div className="w-full">
                        <ImageBox
                          url={formData.images[0]}
                          index={0}
                          isMain={true}
                          onDelete={() => removeImage(0)}
                        />
                      </div>

                      {/* Sub Images - Index 1...N */}
                      <div className="grid grid-cols-3 gap-4">
                        {formData.images.slice(1).map((url, idx) => (
                          <ImageBox
                            key={idx + 1} // Offset key
                            url={url}
                            index={idx + 1} // Real index in logic
                            isMain={false}
                            onDelete={() => removeImage(idx + 1)}
                          />
                        ))}

                        {/* Always show one empty "Add" box at the end for sub-images */}
                        <ImageBox
                          url={null}
                          index={formData.images.length || 1} // Append mode
                          isMain={false}
                          onDelete={() => { }}
                        />
                      </div>

                      <p className="text-xs text-gray-500 italic mt-1">
                        * Drag and drop images or click to upload. First image is the Main Image.
                      </p>
                    </div>
                  </VBox>
                </Panel>

                <Panel className="p-6 gap-6 bg-white rounded-xl shadow-sm">
                  <h3 className="text-xl font-semibold border-b pb-2">
                    3. Pricing & Timing
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <VBox className="gap-4">
                      <label className="font-semibold">Starting Price</label>
                      <input
                        name="startPrice"
                        type="number"
                        onChange={handleChange}
                        className="p-3 border rounded-xl"
                      />
                    </VBox>
                    <VBox className="gap-4">
                      <label className="font-semibold">Step Price</label>
                      <input
                        name="stepPrice"
                        type="number"
                        onChange={handleChange}
                        className="p-3 border rounded-xl"
                      />
                    </VBox>
                    <VBox className="gap-4">
                      <label className="font-semibold">Buy Now Price</label>
                      <input
                        name="buyNowPrice"
                        type="number"
                        onChange={handleChange}
                        className="p-3 border rounded-xl"
                      />
                    </VBox>
                    <VBox className="gap-4">
                      <label className="font-semibold">End Date</label>
                      <input
                        name="endTime"
                        type="datetime-local"
                        onChange={handleChange}
                        className="p-3 border rounded-xl"
                      />
                    </VBox>
                  </div>
                  <HBox className="mt-4">
                    <span className="font-semibold mr-4">Auto-renewal?</span>
                    <input
                      type="checkbox"
                      checked={formData.autoExtend}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          autoExtend: e.target.checked,
                        }))
                      }
                      className="w-5 h-5 accent-[#8C7963]"
                    />
                  </HBox>
                </Panel>
              </>
            )}
          </VBox>

          <HBox className="justify-end gap-4 mt-6">
            <button
              onClick={() => navigate("/seller/products")}
              className="px-6 py-3 bg-gray-200 font-semibold rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-3 bg-[#AD9C86] text-white font-semibold rounded-lg shadow-lg hover:bg-[#968672] disabled:opacity-50"
            >
              {loading ? "Saving..." : isEditMode ? "Append Info" : "Publish"}
            </button>
          </HBox>
        </VBox>
      </HBox>
    </div>
  );
};

export default EditProduct;

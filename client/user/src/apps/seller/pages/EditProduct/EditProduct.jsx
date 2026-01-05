import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Quill from "quill";
import { useToast } from "../../../../components/ui/Toast";
import { useAuth } from "@context/AuthContext";

import Panel from "@shared/components/Panel";
import HBox from "@shared/components/HBox";
import VBox from "@shared/components/VBox";
import ImageUrlInputList from "./ImageUrlInputList";

const API_URL = import.meta.env.VITE_API_URL;

const EditProduct = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { id } = useParams();
  const { user } = useAuth();
  
  const isEditMode = !!id && id !== "undefined";

  const quillRef = useRef(null);
  const quillInstance = useRef(null);
  const [categories, setCategories] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    startPrice: "",
    stepPrice: "",
    buyNowPrice: "",
    endTime: "",
    autoExtend: false,
    images: ["", "", "", ""],
  });

  const [oldDescription, setOldDescription] = useState("");
  const [descriptionContent, setDescriptionContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 1. Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/api/categories/subcategory`);
        if(res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) setCategories(data);
        }
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // 2. Fetch Product Data (Edit Mode)
  useEffect(() => {
    if (!isEditMode) return;

    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products/${id}`);
        if (!res.ok) throw new Error("Product not found");

        const data = await res.json();
        const p = data.product || data;

        const loadedImages = [
            p.main_image_url,
            ...(p.images?.map((img) => typeof img === 'string' ? img : img.image_url) || [])
        ].filter(url => url && typeof url === 'string');

        setFormData({
          name: p.name,
          categoryId: p.category_id,
          startPrice: p.start_price,
          stepPrice: p.step_price,
          buyNowPrice: p.buy_now_price || "",
          endTime: p.end_time ? new Date(p.end_time).toISOString().slice(0, 16) : "",
          autoExtend: p.auto_extend_enabled,
          images: loadedImages.length > 0 ? loadedImages : [""],
        });

        setOldDescription(p.description);
      } catch (err) {
        console.error("Failed to load product:", err);
        setError("Failed to load product details.");
      }
    };
    fetchProduct();
  }, [id, isEditMode]);

  // 3. Quill Logic
  useEffect(() => {
    if (!quillRef.current) return;
    quillRef.current.innerHTML = "";
    const editorContainer = document.createElement("div");
    quillRef.current.appendChild(editorContainer);

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

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const url = isEditMode ? `${API_URL}/api/products/${id}` : `${API_URL}/api/products`;
      const method = isEditMode ? "PATCH" : "POST";

      let payload = {};

      if (isEditMode) {
        // --- EDIT MODE (FIXED) ---
        // Now includes pricing fields so you can fix the step price!
        payload = { 
            description: descriptionContent,
            step_price: formData.stepPrice, // ✅ CRITICAL FIX
            buy_now_price: formData.buyNowPrice || null,
            // You can add start_price here too if you want to allow editing it
        };
        
        if (!descriptionContent && !formData.stepPrice && !formData.buyNowPrice) {
             throw new Error("Please change something to update.");
        }

      } else {
        // --- CREATE MODE ---
        const validImages = formData.images.map(img => img.trim()).filter(img => img !== "");

        if (validImages.length < 4) {
          throw new Error(`You need at least 4 images. You currently have ${validImages.length}.`);
        }

        if (!formData.name || !formData.categoryId || !formData.startPrice || !formData.endTime) {
             throw new Error("Please fill in all required fields.");
        }

        payload = {
          seller_id: user.user_id,
          name: formData.name,
          description: descriptionContent,
          category_id: formData.categoryId,
          start_price: formData.startPrice,
          step_price: formData.stepPrice,
          buy_now_price: formData.buyNowPrice || null,
          start_time: new Date().toISOString(),
          end_time: formData.endTime,
          auto_extend_enabled: formData.autoExtend,
          main_image_url: validImages[0],
          additional_images: validImages.slice(1),
        };
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (!res.ok) throw new Error(resData.message || "Operation failed");

      addToast("Product saved successfully!", "success");
      navigate("/seller/products");

    } catch (err) {
      console.error(err);
      setError(err.message);
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 bg-[#f9f9f9] min-h-screen">
      <HBox className="gap-8 items-start">
        <VBox className="flex-1 gap-8 w-full max-w-4xl mx-auto">
          <HBox>
            <h2 className="text-4xl font-bold text-gray-800">
              {isEditMode ? "Edit Product Details" : "Post New Auction"}
            </h2>
          </HBox>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm">
                <p className="font-bold">Error</p>
                <p>{error}</p>
            </div>
          )}

          <VBox className="flex-1 gap-6">
            <Panel className="p-8 gap-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-2">1. Basic Information</h3>
              <VBox className="gap-4">
                <label className="font-semibold text-gray-700">Product Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  type="text"
                  disabled={isEditMode}
                  placeholder="e.g. 1967 Ford Mustang Fastback"
                  className="p-3 border border-gray-300 rounded-xl font-medium outline-none focus:ring-2 ring-[#8C7963] disabled:bg-gray-50 disabled:text-gray-500"
                />
              </VBox>

              <VBox className="gap-4">
                <label className="font-semibold text-gray-700">
                  {isEditMode ? "Append New Information" : "Detailed Description"}
                </label>
                {isEditMode && oldDescription && (
                  <div className="mb-2 p-4 bg-gray-50 border border-gray-200 rounded-xl max-h-48 overflow-y-auto">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Current Description Preview:</p>
                    <div className="prose prose-sm max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: oldDescription }} />
                  </div>
                )}
                <div className="bg-white border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 ring-[#8C7963]" style={{ height: "300px" }}>
                  <div ref={quillRef} style={{ height: "250px" }} />
                </div>
              </VBox>
            </Panel>

            {!isEditMode && (
              <Panel className="p-8 gap-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-2">2. Category & Images</h3>
                  <VBox className="gap-4">
                    <label className="font-semibold text-gray-700">Category</label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      className="p-3 border border-gray-300 rounded-xl bg-white focus:ring-2 ring-[#8C7963] outline-none cursor-pointer font-medium"
                      required
                    >
                      <option value="">Select a Sub-Category</option>
                      {categories.map((cat) => (
                        <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
                      ))}
                    </select>
                  </VBox>
                  <ImageUrlInputList
                    images={formData.images}
                    onImagesChange={(newImages) => setFormData(prev => ({...prev, images: newImages}))}
                  />
              </Panel>
            )}

            <Panel className="p-8 gap-6 bg-white rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 border-b pb-3 mb-2">3. Pricing & Timing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <VBox className="gap-3">
                  <label className="font-semibold text-gray-700">Starting Price ($)</label>
                  <input name="startPrice" type="number" min="0" disabled={isEditMode} placeholder="0.00" value={formData.startPrice} onChange={handleChange} className="p-3 border border-gray-300 rounded-xl font-bold outline-none focus:ring-2 ring-[#8C7963] disabled:bg-gray-100" />
                </VBox>
                <VBox className="gap-3">
                  <label className="font-semibold text-gray-700">Minimum Step ($)</label>
                  <input name="stepPrice" type="number" min="1" placeholder="e.g. 10" value={formData.stepPrice} onChange={handleChange} className="p-3 border border-gray-300 rounded-xl font-bold outline-none focus:ring-2 ring-[#8C7963]" />
                </VBox>
                <VBox className="gap-3">
                  <label className="font-semibold text-gray-700">Buy Now Price (Optional)</label>
                  <input name="buyNowPrice" type="number" min="0" placeholder="Leave blank if disabled" value={formData.buyNowPrice} onChange={handleChange} className="p-3 border border-gray-300 rounded-xl font-bold outline-none focus:ring-2 ring-[#8C7963]" />
                </VBox>
                <VBox className="gap-3">
                  <label className="font-semibold text-gray-700">Auction End Time</label>
                  <input name="endTime" type="datetime-local" disabled={isEditMode} value={formData.endTime} onChange={handleChange} min={new Date().toISOString().slice(0, 16)} className="p-3 border border-gray-300 rounded-xl font-medium outline-none focus:ring-2 ring-[#8C7963] disabled:bg-gray-100" />
                </VBox>
              </div>
              
              {!isEditMode && (
                  <HBox className="mt-2 bg-orange-50 p-4 rounded-xl border border-orange-100 items-center">
                    <input id="autoExtend" type="checkbox" checked={formData.autoExtend} onChange={(e) => setFormData((prev) => ({ ...prev, autoExtend: e.target.checked }))} className="w-5 h-5 accent-[#AD9C86] cursor-pointer" />
                    <label htmlFor="autoExtend" className="font-semibold text-orange-800 ml-3 cursor-pointer select-none">Enable Auto-Extension (Anti-Sniping)</label>
                  </HBox>
              )}
            </Panel>

          </VBox>

          <HBox className="justify-end gap-4 mt-4 pt-6 border-t border-gray-200">
            <button onClick={() => navigate("/seller/products")} className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50">Cancel</button>
            <button onClick={handleSubmit} disabled={loading} className="px-8 py-3 bg-[#AD9C86] text-white font-bold rounded-xl shadow-md hover:bg-[#968672] disabled:opacity-50 flex items-center gap-2">
              {loading ? "Processing..." : isEditMode ? "Update Product" : "Publish Auction"}
            </button>
          </HBox>
        </VBox>
      </HBox>
    </div>
  );
};

export default EditProduct;
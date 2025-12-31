import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Quill from "quill";

import Panel from "@shared/components/Panel";
import HBox from "@shared/components/HBox";
import VBox from "@shared/components/VBox";

const API_URL = import.meta.env.VITE_API_URL;

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get ID if editing
  const isEditMode = !!id;    

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
    images: ["", "", ""], 
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
            console.log(`[EditProduct] Fetching categories from: ${API_URL}/api/categories`);
            
            const res = await fetch(`${API_URL}/api/categories`);
            
            // Check for HTML response (Wrong URL/Port issue)
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("text/html")) {
                throw new Error("Server returned HTML instead of JSON. Check API_URL port.");
            }

            const data = await res.json();
            if (Array.isArray(data)) setCategories(data);
            
        } catch (err) {
            // FIX: Added braces and full logging
            console.error("Error loading categories:", err);
        }
    };
    fetchCategories();
  }, []);

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

            // Pre-fill form
            setFormData({
                name: p.name,
                categoryId: p.category_id,
                startPrice: p.start_price,
                stepPrice: p.step_price,
                buyNowPrice: p.buy_now_price || "",
                endTime: p.end_time ? p.end_time.slice(0, 16) : "",
                autoExtend: p.auto_extend_enabled,
                images: p.images?.map(img => img.image_url) || ["", "", ""]
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
    quillRef.current.innerHTML = '';
    
    // Create Wrapper
    const editorContainer = document.createElement('div');
    quillRef.current.appendChild(editorContainer);

    // Initialize Quill
    const quill = new Quill(editorContainer, {
      theme: "snow",
      placeholder: isEditMode ? "Write NEW information to append..." : "Describe your product...",
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
      if (quillRef.current) quillRef.current.innerHTML = '';
    };
  }, [isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData((prev) => ({ ...prev, images: newImages }));
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
          alert("Description appended successfully!");
          
      } else {
          // --- CREATE MODE ---
          const validImages = formData.images.filter(img => img.trim() !== "");
          if (validImages.length < 3) throw new Error("At least 3 images required");

          const payload = {
            name: formData.name,
            description: descriptionContent,
            category_id: formData.categoryId,
            start_price: formData.startPrice,
            step_price: formData.stepPrice,
            buy_now_price: formData.buyNowPrice || null,
            end_time: formData.endTime, 
            auto_extend_enabled: formData.autoExtend,
            images: validImages
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
          alert("Product created!");
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

          {error && <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>}

          <VBox className="flex-1 gap-4">
            
            <Panel className="p-6 gap-6 bg-white rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold border-b pb-2">1. Basic Information</h3>
              <VBox>
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

              <VBox>
                <label className="font-semibold mb-1">
                    {isEditMode ? "New Information (Will be appended)" : "Description"}
                </label>
                
                {isEditMode && oldDescription && (
                    <div className="mb-4 p-4 bg-gray-50 border rounded-xl">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-2">Current Description:</p>
                        <div 
                            className="prose prose-sm max-w-none text-gray-600"
                            dangerouslySetInnerHTML={{ __html: oldDescription }} 
                        />
                    </div>
                )}

                <div className="bg-white border rounded-xl overflow-hidden" style={{ height: "250px" }}>
                   <div ref={quillRef} style={{ height: "200px" }} />
                </div>
              </VBox>
            </Panel>

            {!isEditMode && (
                <>
                  <Panel className="p-6 gap-6 bg-white rounded-xl shadow-sm">
                    <h3 className="text-xl font-semibold border-b pb-2">2. Details & Images</h3>
                    <VBox>
                      <label className="font-semibold mb-1">Category</label>
                      <select 
                          name="categoryId"
                          value={formData.categoryId} 
                          onChange={handleChange}
                          className="p-3 border rounded-xl bg-white focus:ring-2 ring-[#8C7963] outline-none"
                          required 
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>
                        ))}
                      </select>
                    </VBox>
                    <VBox>
                        <label className="font-semibold mb-1">Images (Min 3 URLs)</label>
                        {formData.images.map((img, idx) => (
                            <input key={idx} type="text" placeholder={`Image URL #${idx + 1}`} value={img} onChange={(e) => handleImageChange(idx, e.target.value)} className="p-2 border rounded-lg mb-2 text-sm" />
                        ))}
                    </VBox>
                  </Panel>

                  <Panel className="p-6 gap-6 bg-white rounded-xl shadow-sm">
                    <h3 className="text-xl font-semibold border-b pb-2">3. Pricing & Timing</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <VBox><label className="font-semibold">Starting Price</label><input name="startPrice" type="number" onChange={handleChange} className="p-3 border rounded-xl" /></VBox>
                        <VBox><label className="font-semibold">Step Price</label><input name="stepPrice" type="number" onChange={handleChange} className="p-3 border rounded-xl" /></VBox>
                        <VBox><label className="font-semibold">Buy Now Price</label><input name="buyNowPrice" type="number" onChange={handleChange} className="p-3 border rounded-xl" /></VBox>
                        <VBox><label className="font-semibold">End Date</label><input name="endTime" type="datetime-local" onChange={handleChange} className="p-3 border rounded-xl" /></VBox>
                    </div>
                    <HBox className="mt-4">
                        <span className="font-semibold mr-4">Auto-renewal?</span>
                        <input type="checkbox" checked={formData.autoExtend} onChange={(e) => setFormData(prev => ({...prev, autoExtend: e.target.checked}))} className="w-5 h-5 accent-[#8C7963]" />
                    </HBox>
                  </Panel>
                </>
            )}

          </VBox>

          <HBox className="justify-end gap-4 mt-6">
            <button onClick={() => navigate("/seller/products")} className="px-6 py-3 bg-gray-200 font-semibold rounded-lg hover:bg-gray-300">Cancel</button>
            <button onClick={handleSubmit} disabled={loading} className="px-6 py-3 bg-[#AD9C86] text-white font-semibold rounded-lg shadow-lg hover:bg-[#968672] disabled:opacity-50">
              {loading ? "Saving..." : (isEditMode ? "Append Info" : "Publish")}
            </button>
          </HBox>
        </VBox>
      </HBox>
    </div>
  );
};

export default EditProduct;
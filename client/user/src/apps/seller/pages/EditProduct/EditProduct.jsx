import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Quill from "quill";
import "quill/dist/quill.snow.css"; 

import Panel from "@shared/components/Panel";
import HBox from "@shared/components/HBox";
import VBox from "@shared/components/VBox";
import PillSwitch from "@shared/components/PillSwitch";
import Separator from "@shared/components/Separator";

const API_URL = import.meta.env.VITE_API_URL;

const EditProduct = () => {
  const navigate = useNavigate();
  const quillRef = useRef(null); 
  const quillInstance = useRef(null); 

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
  
  const [descriptionContent, setDescriptionContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (quillRef.current && !quillInstance.current) {
      quillInstance.current = new Quill(quillRef.current, {
        theme: "snow",
        placeholder: "Write specific details about your product...",
        modules: {
          toolbar: [
            [{ header: [1, 2, false] }],
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["clean"],
          ],
        },
      });

      quillInstance.current.on("text-change", () => {
        setDescriptionContent(quillInstance.current.root.innerHTML);
      });
    }
  }, []);

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
 
    const validImages = formData.images.filter(img => img.trim() !== "");
    if (validImages.length < 3) {
        setError("You must provide at least 3 image URLs.");
        setLoading(false);
        return;
    }

    try {
      const token = localStorage.getItem("token");
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

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create product");

      alert("Product created successfully!");
      navigate("/seller/products");

    } catch (err) {
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
            <h2 className="text-4xl font-bold">Post New Auction</h2>
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
                  className="p-3 border rounded-xl font-medium focus:ring-2 ring-[#8C7963] outline-none"
                  placeholder="e.g. Vintage Rolex Watch"
                />
              </VBox>

              <VBox>
                <label className="font-semibold mb-1">Description (WYSIWYG)</label>
                <div className="bg-white border rounded-xl overflow-hidden" style={{ height: "250px" }}>
                   <div ref={quillRef} style={{ height: "200px" }} />
                </div>
              </VBox>
            </Panel>

            <Panel className="p-6 gap-6 bg-white rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold border-b pb-2">2. Details & Images</h3>
              
              <VBox>
                <label className="font-semibold mb-1">Category</label>
                <select 
                    name="categoryId"
                    value={formData.categoryId} 
                    onChange={handleChange}
                    className="p-3 border rounded-xl bg-white"
                >
                  <option value="">Select Category</option>
                  <option value="1">Electronics</option>
                  <option value="2">Fashion</option>
                </select>
              </VBox>

              <VBox>
                <label className="font-semibold mb-1">Images (Min 3 URLs)</label>
                {formData.images.map((img, idx) => (
                    <input
                        key={idx}
                        type="text"
                        placeholder={`Image URL #${idx + 1}`}
                        value={img}
                        onChange={(e) => handleImageChange(idx, e.target.value)}
                        className="p-2 border rounded-lg mb-2 text-sm"
                    />
                ))}
                <p className="text-xs text-gray-500">Note: Enter direct image links (e.g., https://imgur.com/example.jpg) for now.</p>
              </VBox>
            </Panel>

            {/* 3. Pricing & Timing */}
            <Panel className="p-6 gap-6 bg-white rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold border-b pb-2">3. Pricing & Timing</h3>
              
              <div className="grid grid-cols-2 gap-4">
                  <VBox>
                    <label className="font-semibold">Starting Price ($)</label>
                    <input name="startPrice" type="number" onChange={handleChange} className="p-3 border rounded-xl" />
                  </VBox>
                  <VBox>
                    <label className="font-semibold">Step Price ($)</label>
                    <input name="stepPrice" type="number" onChange={handleChange} className="p-3 border rounded-xl" />
                  </VBox>
                  <VBox>
                    <label className="font-semibold">Buy Now Price (Optional)</label>
                    <input name="buyNowPrice" type="number" onChange={handleChange} className="p-3 border rounded-xl" />
                  </VBox>
                  <VBox>
                    <label className="font-semibold">End Date & Time</label>
                    <input name="endTime" type="datetime-local" onChange={handleChange} className="p-3 border rounded-xl" />
                  </VBox>
              </div>

              <HBox className="mt-4">
                  <span className="font-semibold mr-4">Auto-renewal?</span>
                  <input 
                    type="checkbox" 
                    checked={formData.autoExtend}
                    onChange={(e) => setFormData(prev => ({...prev, autoExtend: e.target.checked}))}
                    className="w-5 h-5 accent-[#8C7963]"
                  />
                  <span className="ml-2 text-sm text-gray-500">(Extends 10 mins if new bid in last 5 mins)</span>
              </HBox>
            </Panel>
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
              {loading ? "Publishing..." : "Save & Publish"}
            </button>
          </HBox>
        </VBox>
      </HBox>
    </div>
  );
};

export default EditProduct;
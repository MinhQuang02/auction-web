import React from "react";
import { useNavigate } from "react-router-dom";
import editIcon from "@assets/images/_editIcon.svg";
import removeIcon from "@assets/images/_removeIcon.svg";
import arrowIcon from "@assets/images/_arrowIcon.svg"; 

const API_URL = import.meta.env.VITE_API_URL;

const ProductCard = ({ product, mode = "viewer", onDelete }) => {
  const navigate = useNavigate();

  const productId = product.product_id || product.id;

  const handleDelete = async (e) => {
    e.stopPropagation();
    
    if (!productId) {
        alert("Error: Product ID is missing");
        return;
    }

    if (!confirm("Are you sure you want to delete this product? This cannot be undone.")) return;

    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/products/${productId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Failed to delete");
        
        if (onDelete) onDelete(); 
        else window.location.reload(); 

    } catch (err) {
        alert(err.message);
    }
  };

  return (
    <div className="group relative bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition overflow-hidden">
      <div className="h-[200px] w-full bg-gray-100 relative overflow-hidden">
        <img
          src={product.main_image_url || product.image || product.images?.[0]?.image_url} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          {mode === "owner" && (
            <>
              {/* 1. ARROW (VIEW) */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if(productId) navigate(`/product/${productId}`);
                }}
                className="bg-white p-2 rounded-full hover:bg-gray-100 transition transform hover:scale-110"
                title="View Product Page"
              >
                <img src={arrowIcon} alt="View" className="w-5 h-5" />
              </button>

              {/* 2. EDIT */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if(productId) navigate(`/seller/products/edit/${productId}`);
                }}
                className="bg-white p-2 rounded-full hover:bg-gray-100 transition transform hover:scale-110"
                title="Edit Product"
              >
                <img src={editIcon} alt="Edit" className="w-5 h-5" />
              </button>

              {/* 3. DELETE */}
              <button 
                onClick={handleDelete}
                className="bg-white p-2 rounded-full hover:bg-red-50 transition transform hover:scale-110"
                title="Remove Product"
              >
                <img src={removeIcon} alt="Delete" className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-800 truncate pr-2 w-full" title={product.name}>
            {product.name}
          </h3>
        </div>
        
        <div className="flex justify-between items-center text-sm">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}>
                {product.status}
            </span>
            <span className="font-bold text-[#AD9C86]">
                ${parseFloat(product.current_price || product.start_price || 0).toLocaleString()}
            </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
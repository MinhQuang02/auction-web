import React from "react";
import { useNavigate } from "react-router-dom"; // 1. Import Hook
import editIcon from "@assets/images/_editIcon.svg";
import removeIcon from "@assets/images/_removeIcon.svg";
import viewIcon from "@assets/images/_viewIcon.svg";

const ProductCard = ({ product, mode = "viewer" }) => {
  const navigate = useNavigate(); // 2. Initialize Hook

  return (
    <div className="group relative bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition overflow-hidden">
      
      {/* Product Image */}
      <div className="h-[200px] w-full bg-gray-100 relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* --- HOVER OVERLAY (Actions) --- */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
          
          {/* OWNER MODE: Show Edit & Delete */}
          {mode === "owner" && (
            <>
              {/* ✅ 3. EDIT BUTTON (The "Pencil") */}
              <button 
                onClick={(e) => {
                  e.stopPropagation(); // Prevent clicking the card itself
                  navigate(`/seller/products/edit/${product.id}`); // GO TO EDIT PAGE
                }}
                className="bg-white p-2 rounded-full hover:bg-gray-100 transition transform hover:scale-110"
                title="Append Description / Edit"
              >
                <img src={editIcon} alt="Edit" className="w-5 h-5" />
              </button>

              {/* DELETE BUTTON (The "Trashcan") */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  // Add delete logic here later if needed
                  if(confirm("Are you sure?")) console.log("Delete", product.id);
                }}
                className="bg-white p-2 rounded-full hover:bg-red-50 transition transform hover:scale-110"
                title="Remove Product"
              >
                <img src={removeIcon} alt="Delete" className="w-5 h-5" />
              </button>
            </>
          )}

          {/* VIEWER MODE: Show View Details */}
          {mode === "viewer" && (
            <button 
               onClick={() => navigate(`/product/${product.id}`)}
               className="bg-white p-2 rounded-full hover:bg-gray-100 transition"
            >
              <img src={viewIcon} alt="View" className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Card Details */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-800 truncate pr-2" title={product.name}>
            {product.name}
          </h3>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {product.status}
          </span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">{product.seller}</span>
            <span className="font-bold text-[#AD9C86]">{product.price}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
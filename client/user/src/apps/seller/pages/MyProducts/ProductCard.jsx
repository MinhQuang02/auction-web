import React from "react";
import { useNavigate } from "react-router-dom";
import editIcon from "@assets/images/_editIcon.svg";
import removeIcon from "@assets/images/_removeIcon.svg";
import arrowIcon from "@assets/images/_arrowIcon.svg"; 

const ProductCard = ({ product, mode = "viewer" }) => {
  const navigate = useNavigate();

  return (
    <div className="group relative bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition overflow-hidden">
 
      <div className="h-[200px] w-full bg-gray-100 relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">

          {mode === "owner" && (
            <>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/seller/products/edit/${product.id}`);
                }}
                className="bg-white p-2 rounded-full hover:bg-gray-100 transition transform hover:scale-110"
                title="Edit Product"
              >
                <img src={editIcon} alt="Edit" className="w-5 h-5" />
              </button>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/product/${product.id}`);
                }}
                className="bg-white p-2 rounded-full hover:bg-gray-100 transition transform hover:scale-110"
                title="View Product Page"
              >
                <img src={arrowIcon} alt="View" className="w-5 h-5" />
              </button>

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if(confirm("Are you sure?")) console.log("Delete", product.id);
                }}
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
            <span className="font-bold text-[#AD9C86]">{product.price}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
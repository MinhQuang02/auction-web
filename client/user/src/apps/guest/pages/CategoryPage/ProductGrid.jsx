import { Link } from "react-router-dom";

import wishIcon from "@assets/images/_wishIcon.svg";
import viewIcon from "@assets/images/_viewIcon.svg";

import keyboardImg from "@assets/images/_keyboardImg.png";
import monitorImg from "@assets/images/_monitorImg.png";
import gamepadImg from "@assets/images/_gamepadImg.png";
import chairImg from "@assets/images/_chairImg.png";

const ProductGrid = ({ products = [] }) => {
  return (
    <div className="flex-grow bg-transparent p-0 flex flex-col font-sans text-[#1f1f1f] relative h-full">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        {/* Breadcrumb / Count */}
        <div className="text-sm">
          <span className="text-gray-400">Total Products:</span>{" "}
          <span className="font-medium text-black ml-1">{products.length}</span>
        </div>

        {/* Sorting & Layout Placeholders (Visual Only) */}
        <div className="flex items-center gap-3">
          {/* Sorting UI kept as placeholder */}
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No products found in this category.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6">
          {products.map((product) => {
            const imageUrl = product.main_image_url || product.images?.[0]?.image_url || "https://via.placeholder.com/300";
            const currentPrice = product.current_price || product.start_price;
            const endDate = new Date(product.end_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const sellerName = product.seller?.full_name || "***";

            return (
              <div key={product.product_id} className="group flex flex-col gap-2">
                <div className="relative bg-[#F5F5F5] rounded h-[250px] flex items-center justify-center overflow-hidden p-6 group-hover:shadow-lg transition-all duration-300">
                  {/* Badge */}
                  <span className="absolute top-2 left-2 bg-[#AE9B84] text-white text-[10px] px-2 py-0.5 rounded shadow-sm">
                    {product.bid_count} Bids
                  </span>

                  {/* Actions */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button className="bg-white rounded-full p-1 shadow hover:bg-gray-100 transition">
                      <img src={wishIcon} alt="Wish" className="w-3 h-3" />
                    </button>
                    <Link to={`/product/${product.product_id}`} className="bg-white rounded-full p-1 shadow hover:bg-gray-100 transition block">
                      <img src={viewIcon} alt="View" className="w-3 h-3" />
                    </Link>
                  </div>

                  {/* Image */}
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain drop-shadow-sm transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Add to Cart / View Details */}
                  <Link
                    to={`/product/${product.product_id}`}
                    className="absolute bottom-0 w-full bg-black text-white py-2 text-xs font-medium text-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                  >
                    View Details
                  </Link>
                </div>

                <div>
                  <h3
                    className="font-bold text-sm mb-0.5 truncate"
                    title={product.name}
                  >
                    {product.name}
                  </h3>
                  <div className="flex gap-2 text-xs mb-1">
                    <span className="text-[#AE9B84] font-medium">
                      ${Number(currentPrice).toFixed(2)}
                    </span>
                    <span className="text-gray-400">by {sellerName}</span>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-full px-2 py-0.5 text-[9px] text-gray-500 inline-block">
                    Ends: {endDate}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
};

export default ProductGrid;

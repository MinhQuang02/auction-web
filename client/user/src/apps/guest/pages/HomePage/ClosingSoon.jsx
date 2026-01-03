import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import decorativeBg from "@assets/images/_decorativeBg2.svg";
import arrowIcon from "@assets/images/_arrowIcon.svg";

const API_URL = import.meta.env.VITE_API_URL;

const ClosingSoon = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products/ongoing?limit=5`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error("Failed to fetch closing soon products", err);
      }
    };
    fetchProducts();
  }, []);

  if (products.length === 0) return null;

  return (
    <section
      id="closing-soon"
      className="py-10 relative w-full overflow-hidden"
    >
      <div className="container mx-auto px-5 lg:px-12 relative">
        {/* Decorative Element */}
        <img
          src={decorativeBg}
          alt="Decorative element"
          className="absolute -top-0.5 -right-12 rotate-[20.36deg] z-0 hidden lg:block pointer-events-none"
        />

        {/* Header Section */}
        <div className="mb-14 relative z-10">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-5 h-10 bg-[#AE9B84] rounded"></div>
            <span className="text-[#AE9B84] font-semibold">Our Products</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-wide">
            Top 5 Closing Soon
          </h2>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 relative z-10">
          {products.map((product, index) => {
            const isLargeItem = index < 2;
            const colSpanClass = isLargeItem
              ? "lg:col-span-3"
              : "lg:col-span-2";
            const imageHeightClass = isLargeItem ? "h-[350px]" : "h-[291px]";
            const titleSizeClass = isLargeItem ? "text-xl" : "text-lg";

            const imageUrl = product.main_image_url || "https://via.placeholder.com/300";
            const currentPrice = product.current_price || product.start_price;
            const buyNowPrice = product.buy_now_price;
            const startDate = new Date(product.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const endDate = new Date(product.end_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            // Server masks it
            const topBid = product.bids?.[0]; // getOngoing now includes bids
            const bidderName = topBid?.bidder?.full_name ? `by ${topBid.bidder.full_name}` : "No Bids";
            const bidCount = product.bid_count || 0;

            return (
              <div
                key={product.product_id}
                className={`${colSpanClass} bg-[#F5F5F5] shadow-sm p-5 flex flex-col gap-4 rounded-b-lg group hover:shadow-lg transition-all duration-300`}
              >
                {/* Product Image */}
                <div className={`w-full ${imageHeightClass} flex items-center justify-center bg-white rounded-t-3xl overflow-hidden p-8 lg:p-10 relative`}>
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110"
                  />
                  {buyNowPrice && (
                    <div className="absolute top-2 left-2 bg-[#AE9B84] text-white text-xs px-2 py-1 rounded">
                      Buy Now: ${Number(buyNowPrice).toFixed(0)}
                    </div>
                  )}
                </div>

                {/* Date & Action Button */}
                <div className="flex justify-between items-center">
                  <div className="bg-[#1f1f1f] text-[#d1d1d6] text-xs px-3 py-1.5 rounded-full whitespace-nowrap">
                    {startDate} - {endDate}
                  </div>
                  <Link
                    to={`/product/${product.product_id}`}
                    className="bg-[#1f1f1f] border border-[#404040] text-[#d1d1d6] text-sm px-5 py-3.5 rounded-lg flex items-center gap-1 hover:bg-black transition shadow-md"
                  >
                    <span>Bid Now</span>
                    <img src={arrowIcon} alt="arrow" />
                  </Link>
                </div>

                {/* Title */}
                <h3 className={`font-medium ${titleSizeClass} truncate`} title={product.name}>
                  {product.name}
                </h3>

                {/* Price & Author */}
                <div className="flex items-center gap-4 text-sm w-full">
                  <span className="text-gray-500">Price</span>
                  <span className="w-1 h-1 bg-[#ccc] rounded-full"></span>
                  <span className="font-medium text-black">
                    ${Number(currentPrice).toFixed(2)}
                  </span>

                  <span className="text-gray-500">Leader</span>
                  <span className="w-1 h-1 bg-[#ccc] rounded-full"></span>
                  <span className="font-medium text-black">
                    {bidderName}
                  </span>

                  <span className="ml-auto text-xs text-gray-800 font-bold whitespace-nowrap">
                    {bidCount} bids
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ClosingSoon;

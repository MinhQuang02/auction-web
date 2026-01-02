import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import decorativeBg from "@assets/images/_decorativeBg1.svg";
import arrowIcon from "@assets/images/_arrowIcon.svg";

const HottestAuctions = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/products/featured?limit=5");
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error("Failed to fetch hottest products", err);
      }
    };
    fetchProducts();
  }, []);

  if (products.length === 0) return null;

  return (
    <section
      id="hottest-auctions"
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
            Top 5 Hottest Auctions
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

            const imageUrl = product.main_image_url || product.images?.[0]?.image_url || "https://via.placeholder.com/300";
            const currentPrice = product.current_price || product.start_price;
            const endDate = new Date(product.end_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            // For Hottest, 'bids' is included in `getFeaturedProducts`
            const topBid = product.bids?.[0];
            const bidderName = topBid?.bidder?.full_name
              ? `***${topBid.bidder.full_name.split(' ').pop()}`
              : "No Bids";
            const bidCount = product.bid_count;

            return (
              <div
                key={product.product_id}
                className={`${colSpanClass} bg-[#F5F5F5] shadow-sm p-5 flex flex-col gap-4 rounded-b-lg group hover:shadow-lg transition-all duration-300`}
              >
                {/* Product Image - Centered and Contained with MORE Padding to make it smaller */}
                <div className={`w-full ${imageHeightClass} flex items-center justify-center bg-white rounded-t-3xl overflow-hidden p-8 lg:p-10`}>
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                {/* Date & Action Button */}
                <div className="flex justify-between items-center">
                  <div className="bg-[#1a1a1a] text-[#b3b3b2] text-xs px-3 py-2 rounded-full">
                    {bidCount} Bids
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
                <div className="flex items-center gap-4 text-sm">
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
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HottestAuctions;

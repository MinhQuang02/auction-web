import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const FiveStars = () => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <svg
        key={star}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-3 h-3 text-[#FFB800]"
      >
        <path
          fillRule="evenodd"
          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
          clipRule="evenodd"
        />
      </svg>
    ))}
  </div>
);

const Overview = () => {
  const [products, setProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/products/featured");
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error("Failed to fetch featured products", err);
      }
    };
    fetchFeatured();
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (products.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % products.length);
    }, 5000); // 5 seconds per slide
    return () => clearInterval(interval);
  }, [products.length]);

  const handleNext = () => {
    if (products.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % products.length);
  };

  const handlePrev = () => {
    if (products.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  if (products.length === 0) {
    return (
      <div className="flex-grow bg-[#f2f2f2] rounded-2xl shadow-lg h-auto lg:h-[530px] flex items-center justify-center text-gray-400">
        Loading Featured Auctions...
      </div>
    );
  }

  const product = products[currentIndex];
  const imageUrl = product.main_image_url || product.images?.[0]?.image_url || "https://via.placeholder.com/800x400?text=No+Image";
  const leadingBid = product.bids?.[0];
  const leadingPrice = leadingBid?.max_bid_amount || product.current_price || product.start_price;
  const leadingBidder = leadingBid?.bidder?.full_name
    ? `by ***${leadingBid?.bidder?.full_name.split(' ').pop()}`
    : "No bids yet";

  // Calculate Time Remaining
  const now = new Date();
  const end = new Date(product.end_time);
  const diff = end - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const timeRemaining = diff > 0 ? `${days} days, ${hours}h` : "Ended";

  return (
    <div className="flex-grow bg-[#f2f2f2] rounded-2xl shadow-lg overflow-hidden flex flex-col font-sans text-[#1f1f1f] h-auto lg:h-[530px] relative transition-all duration-500">

      {/* Content Section */}
      <div className="flex flex-col md:flex-row w-full h-full animate-fade-in key={currentIndex}">
        {/* --- Left Column: Product Information --- */}
        <div className="w-full md:w-1/2 md:border-r-2 border-dashed border-[#ccc] flex flex-col relative bg-white">

          {/* Breadcrumb Navigation - Always Top Left */}
          <div className="flex flex-wrap gap-2.5 p-6 md:p-8 md:pb-2">
            <span className="text-[12px] font-medium text-gray-500">All</span>
            {product.category?.parent && (
              <>
                <span className="text-[10px] text-gray-400">/</span>
                <span className="text-[12px] font-medium text-gray-500">{product.category.parent.name}</span>
              </>
            )}
            {product.category && (
              <>
                <span className="text-[10px] text-gray-400">/</span>
                <span className="text-[12px] font-medium text-[#AE9B84]">{product.category.name}</span>
              </>
            )}
          </div>

          <div className="px-6 md:px-8 flex-grow flex flex-col justify-center items-center">
            {/* Image Container - Centered and Contained */}
            <div className="w-full h-[250px] flex items-center justify-center mb-6">
              <img
                src={imageUrl}
                alt={product.name}
                className="max-h-full max-w-full object-contain drop-shadow-md transition-transform duration-500 hover:scale-105"
              />
            </div>

            <div className="w-full text-center">
              <h2
                className="font-bold text-xl md:text-2xl mb-2 uppercase tracking-tight truncate w-full"
                title={product.name}
              >
                {product.name}
              </h2>

              <div className="flex items-center justify-center gap-2 mb-4">
                <FiveStars />
                <span className="text-sm font-semibold opacity-50">({product.bid_count} Bids)</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- Right Column: Bid Information Grid --- */}
        <div className="w-full md:w-1/2 flex flex-col">
          <div className="flex-grow grid grid-cols-2">
            {/* Leading Bid Price */}
            <div className="p-4 md:p-6 flex flex-col items-center justify-center text-center border-b-2 border-r-2 border-dashed border-[#ccc] hover:bg-gray-50 transition">
              <span className="font-medium text-xl md:text-2xl mb-1 text-black">${Number(leadingPrice).toFixed(2)}</span>
              <span className="text-[10px] text-gray-500">Leading Bid Price</span>
            </div>

            {/* Leading Bidder */}
            <div className="p-4 md:p-6 flex flex-col items-center justify-center text-center border-b-2 border-dashed border-[#ccc] hover:bg-gray-50 transition">
              <span className="font-medium text-xl md:text-2xl mb-1 truncate w-full px-2 text-black">
                {leadingBidder}
              </span>
              <span className="text-[10px] text-gray-500">Leading Bidder</span>
            </div>

            {/* Time Remaining */}
            <div className="p-4 md:p-6 flex flex-col items-center justify-center text-center border-r-2 md:border-b-0 border-dashed border-[#ccc] border-b-2 hover:bg-gray-50 transition">
              <span className="font-medium text-xl md:text-2xl mb-1 text-black">
                {timeRemaining}
              </span>
              <span className="text-[10px] text-gray-500">Time Remaining</span>
            </div>

            {/* Buy It Now Price */}
            <div className="p-4 md:p-6 flex flex-col items-center justify-center text-center border-b-2 md:border-b-0 border-dashed border-[#ccc] hover:bg-gray-50 transition">
              <span className="font-medium text-xl md:text-2xl mb-1 text-black">
                {product.buy_now_price ? `$${Number(product.buy_now_price).toFixed(2)}` : "N/A"}
              </span>
              <span className="text-[10px] text-gray-500">Buy It Now</span>
            </div>
          </div>

          {/* Action Area */}
          <div className="p-6 flex items-center justify-center bg-[#f9f9f9]">
            <Link
              to={`/product/${product.product_id}`}
              className="bg-[#1f1f1f] text-white rounded-[4px] px-8 py-3.5 flex items-center gap-3 text-sm font-medium hover:bg-black transition shadow-lg border border-[#333]"
            >
              <span>Bid Now</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation & Indicators Overlay */}
      <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-4 pointer-events-none">
        <button
          onClick={handlePrev}
          className="w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition cursor-pointer text-gray-800 pointer-events-auto hover:scale-110 active:scale-95 z-20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <button
          onClick={handleNext}
          className="w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition cursor-pointer text-gray-800 pointer-events-auto hover:scale-110 active:scale-95 z-20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Slide Indicators - Moved to left side under image */}
      <div className="absolute bottom-4 left-1/4 transform -translate-x-1/2 flex gap-1 z-20">
        {products.map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-[#AE9B84]' : 'w-1.5 bg-gray-300'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Overview;

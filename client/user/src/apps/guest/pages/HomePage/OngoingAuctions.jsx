import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import arrowLeft from "@assets/images/_arrowLeft.svg";
import arrowRight from "@assets/images/_arrowRight.svg";
import wishIcon from "@assets/images/_wishIcon.svg";
import viewIcon from "@assets/images/_viewIcon.svg";

const OngoingAuctions = () => {
  const [products, setProducts] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchOngoing = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/products/ongoing");
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error("Failed to fetch ongoing products", err);
      }
    };
    fetchOngoing();
  }, []);

  // Auto-scroll logic (Slower)
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        // If reached end, scroll back to start, else scroll one item width (approx 300px)
        if (scrollLeft + clientWidth >= scrollWidth - 10) { // Tolerance
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
      }
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [products]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const maskName = (fullName) => {
    if (!fullName) return "No Bids";
    const len = fullName.length;
    if (len <= 3) return `***${fullName}`;
    return `***${fullName.substring(len - 3)}`;
  };

  if (products.length === 0) return null;

  return (
    <section
      id="ongoing-auctions"
      className="container mx-auto px-5 lg:px-12 py-10"
    >
      {/* Header Section */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-5 h-10 bg-[#AE9B84] rounded"></div>
            <span className="text-[#AE9B84] font-semibold">Today’s</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-wide">
            Ongoing Auctions
          </h2>
        </div>

        {/* Navigation Arrows */}
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="bg-gray-100 p-3 rounded-full cursor-pointer hover:bg-[#AE9B84] hover:text-white transition group"
          >
            <img src={arrowLeft} alt="Prev" className="w-6 h-6 group-hover:invert group-hover:brightness-0 transition" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="bg-gray-100 p-3 rounded-full cursor-pointer hover:bg-[#AE9B84] hover:text-white transition group"
          >
            <img src={arrowRight} alt="Next" className="w-6 h-6 group-hover:invert group-hover:brightness-0 transition" />
          </button>
        </div>
      </div>

      {/* Scrollable List */}
      <div
        ref={scrollRef}
        className="flex gap-8 overflow-x-auto pb-6 scrollbar-hide snap-x scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => {
          const imageUrl = product.main_image_url || product.images?.[0]?.image_url || "https://via.placeholder.com/270x250?text=No+Image";
          const buyNowPrice = product.buy_now_price;
          const currentPrice = product.current_price || product.start_price;
          const bidderName = maskName(product.current_bidder?.full_name);

          // Date formatting
          const startDate = new Date(product.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          const endDate = new Date(product.end_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

          return (
            <div key={product.product_id} className="flex-none w-[270px] snap-center">
              {/* Image Card */}
              <div className="relative bg-[#F5F5F5] rounded-md shadow-sm h-[250px] flex justify-center items-center overflow-hidden mb-4 group transition-transform duration-300 hover:shadow-lg">
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="max-h-[180px] object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                />

                {/* Price Tag (Buy Now) */}
                {buyNowPrice && (
                  <div className="absolute top-3 left-3 bg-[#AE9B84] text-white text-xs px-3 py-1 rounded">
                    Buy Now: ${Number(buyNowPrice).toFixed(0)}
                  </div>
                )}

                {/* Action Buttons (Wishlist / View) */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="w-[34px] h-[34px] rounded-full bg-white flex items-center justify-center shadow hover:bg-gray-100 transition">
                    <img src={wishIcon} alt="Wish" />
                  </button>
                  <button className="w-[34px] h-[34px] rounded-full bg-white flex items-center justify-center shadow hover:bg-gray-100 transition">
                    <img src={viewIcon} alt="View" />
                  </button>
                </div>

                {/* Bid Now Button Overlay */}
                <Link
                  to={`/product/${product.product_id}`}
                  className="absolute bottom-0 w-full bg-black text-white text-center py-2 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  Bid Now
                </Link>
              </div>

              {/* Product Info */}
              <h3
                className="font-medium text-base mb-2 truncate"
                title={product.name}
              >
                {product.name}
              </h3>
              <div className="flex gap-3 items-center mb-2">
                <span className="text-[#AE9B84] font-medium">
                  ${Number(currentPrice).toFixed(2)}
                </span>
                <span className="text-gray-500 opacity-50 font-medium text-sm">
                  by {bidderName}
                </span>
              </div>
              <div className="bg-gray-200/50 rounded-full px-2 py-0.5 text-[10px] inline-block text-gray-600">
                {startDate} - {endDate}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default OngoingAuctions;

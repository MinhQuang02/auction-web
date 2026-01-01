import React, { useState, useEffect } from "react";
import { useAuth } from "@context/AuthContext";
import { useNavigate } from "react-router-dom";

// Remove the static import
// import mainProductImg from "@assets/images/_gamepadImg.png"; 

const Product = ({ product }) => { // <--- 1. Accept the prop
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // State for the interactive Main Image (gallery)
  const [activeImage, setActiveImage] = useState("");
  const [bidAmount, setBidAmount] = useState(0);

  // 2. Sync state with incoming product data
  useEffect(() => {
    if (product) {
      // Set initial main image to the first one
      const firstImg = product.images?.[0]?.image_url || product.main_image_url || "";
      setActiveImage(firstImg);
      
      // Set initial bid amount to (Current Price + Step Price)
      const nextBid = (product.current_price || product.start_price) + (product.step_price || 10);
      setBidAmount(nextBid);
    }
  }, [product]);

  if (!product) return null; // Safety check

  // Helper to calculate "Relative Time" (e.g., "Ends in 3 days")
  const getTimeRemaining = (endTime) => {
    const total = Date.parse(endTime) - Date.parse(new Date());
    if (total <= 0) return "Closed";
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    if (days > 3) return new Date(endTime).toLocaleDateString();
    return `${days}d ${hours}h remaining`;
  };

  const renderStars = (filledCount = 0) => {
    return (
      <div className="flex text-[#FFAD33] text-sm">
        {[...Array(5)].map((_, index) => (
          <svg
            key={index}
            className={`w-4 h-4 fill-current ${index < filledCount ? "" : "text-gray-300"}`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-grow bg-white p-0 font-sans text-[#1f1f1f]">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm mb-6 text-gray-500">
        <span>Home</span> <span className="text-gray-400">/</span>
        <span>Auctions</span> <span className="text-gray-400">/</span>
        {/* Dynamic Name */}
        <span className="text-black font-medium truncate max-w-[200px]">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-8 h-auto xl:h-[480px]">
        {/* --- Left Column: Image Gallery --- */}
        <div className="flex flex-col-reverse md:flex-row gap-4 h-full w-full">
          {/* Thumbnails List - Dynamic Map */}
          <div className="flex md:flex-col gap-4 justify-start w-full md:w-[110px] flex-none h-auto md:h-full overflow-x-auto md:overflow-y-auto custom-scrollbar">
            {product.images?.map((imgObj, index) => (
              <div
                key={index}
                onClick={() => setActiveImage(imgObj.image_url)}
                className={`
                  bg-[#F2F2F2] rounded-xl shadow-sm h-[80px] w-[80px] md:h-[110px] md:w-full 
                  flex-none flex items-center justify-center cursor-pointer 
                  border transition p-2
                  ${activeImage === imgObj.image_url ? "border-black" : "border-transparent hover:border-gray-300"}
                `}
              >
                <img
                  src={imgObj.image_url}
                  className="w-full h-full object-contain"
                  alt={`Thumb ${index + 1}`}
                />
              </div>
            ))}
          </div>

          {/* Main Image Display */}
          <div className="bg-[#F2F2F2] rounded-2xl shadow-lg flex-grow flex items-center justify-center p-8 w-full h-[300px] md:h-full relative">
            {activeImage ? (
                <img
                src={activeImage}
                className="w-auto h-auto max-h-full max-w-full object-contain drop-shadow-2xl"
                alt={product.name}
                />
            ) : (
                <div className="text-gray-400">No Image Available</div>
            )}
            
            {/* Status Badge */}
            <div className="absolute top-4 left-4 bg-red-500 text-white text-xs px-2 py-1 rounded">
                {product.status === 'active' ? 'Live Auction' : product.status}
            </div>
          </div>
        </div>

        {/* --- Right Column: Product Info & Actions --- */}
        <div className="flex flex-col h-full justify-between py-1 overflow-y-auto">
          <div>
            <h1 className="text-2xl font-bold mb-3 leading-tight">
              {product.name}
            </h1>

            {/* Rating & Stock Status */}
            <div className="flex items-center gap-2 mb-3">
              {renderStars(4)} 
              <span className="text-gray-500 text-sm">({product.view_count || 0} Views)</span>
              <span className="text-gray-300">|</span>
              <span className="text-[#AE9B84] text-sm font-medium">
                {product.status === 'active' ? 'Bidding Open' : 'Closed'}
              </span>
            </div>

            {/* Price Info */}
            <div className="flex items-baseline gap-3 mb-3">
              <span className="text-2xl font-semibold">
                Current: ${product.current_price?.toLocaleString()}
              </span>
              {product.buy_now_price && (
                 <span className="text-xs text-gray-500">
                    Buy Now: ${product.buy_now_price?.toLocaleString()}
                 </span>
              )}
            </div>

            {/* Auction Times */}
            <div className="text-sm text-gray-700 space-y-1 mb-3">
              <p>• Start: <span className="font-medium">{new Date(product.start_time).toLocaleString()}</span></p>
              <p>• End: <span className="font-medium text-red-600">{getTimeRemaining(product.end_time)}</span></p>
            </div>

            {/* Description (With HTML support for Quill) */}
            <div className="text-sm text-gray-600 leading-snug mb-4 border-b pb-4 border-gray-300 max-h-[150px] overflow-y-auto">
                <div dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>

            {/* Highest Bid Info (Placeholder for now until we link Bid History) */}
            <div className="mb-4">
              <h3 className="text-lg font-medium mb-1">
                Step Price: +${product.step_price}
              </h3>
              <div className="text-xs text-gray-500">
                 Seller: {product.seller?.full_name || "Unknown"}
              </div>
            </div>
          </div>

          {/* Action Buttons Container */}
          <div className="w-full">
            {!isAuthenticated ? (
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-[#AE9B84] hover:bg-[#9c8a74] text-white h-[44px] rounded font-medium transition text-sm"
              >
                Log in to bid
              </button>
            ) : (
              <>
                {/* Bidding Control Row */}
                <div className="flex items-center gap-2 mb-4 w-full">
                  {/* Price Adjuster */}
                  <div className="flex items-center border border-gray-400 rounded h-[44px] flex-none">
                    <button
                      onClick={() => setBidAmount((prev) => Math.max(product.current_price + product.step_price, prev - product.step_price))}
                      className="px-3 text-xl text-gray-600 hover:bg-gray-100 h-full border-r border-gray-400"
                    >
                      -
                    </button>

                    <input
                      type="text"
                      value={`$${bidAmount}`}
                      readOnly
                      className="w-[80px] text-center font-bold h-full text-lg bg-transparent"
                    />

                    <button
                      onClick={() => setBidAmount((prev) => prev + product.step_price)}
                      className="px-3 text-xl text-gray-600 hover:bg-gray-100 h-full border-l border-gray-400"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => console.log("Place Bid:", bidAmount)}
                    className="bg-[#AE9B84] hover:bg-[#9c8a74] text-white px-4 h-[44px] rounded font-medium transition flex-1 whitespace-nowrap text-sm"
                  >
                    Bid Now
                  </button>

                  <button className="border border-gray-400 rounded h-[44px] w-[44px] flex items-center justify-center hover:bg-gray-50 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
import React, { useState, useEffect } from "react";
import { useAuth } from "@context/AuthContext";
import { useNavigate } from "react-router-dom";

// Remove the static import
// import mainProductImg from "@assets/images/_gamepadImg.png"; 

const Product = ({ product }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // State for image gallery
  const [activeImage, setActiveImage] = useState("");
  const [allImages, setAllImages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState(0);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const token = localStorage.getItem('token');
  const API_URL = import.meta.env.VITE_API_URL;

  // Check Watchlist Status
  useEffect(() => {
    if (!token || !product) return;
    const checkWatchlist = async () => {
      try {
        const res = await fetch(`${API_URL}/api/watchlist`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const found = data.find(item => item.product_id === product.product_id);
          setIsWatchlisted(!!found);
        }
      } catch (err) {
        console.error(err);
      }
    };
    checkWatchlist();
  }, [product, token]);

  const handleToggleWatchlist = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const id = product.product_id;
    // Optimistic
    setIsWatchlisted(prev => !prev);

    try {
      if (isWatchlisted) {
        await fetch(`${API_URL}/api/watchlist/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      } else {
        await fetch(`${API_URL}/api/watchlist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ product_id: id })
        });
      }
    } catch (err) {
      console.error(err);
      setIsWatchlisted(prev => !prev); // Revert
    }
  };

  // Constants
  const MAX_THUMBNAILS = 4; // Show 3 thumbnails + 1 "+N" overlay

  // 2. Sync state with incoming product data
  useEffect(() => {
    if (product) {
      // 1. Combine Main Image + Additional Images into one unique list
      const imagesList = [];
      if (product.main_image_url) imagesList.push(product.main_image_url);
      if (product.images && product.images.length > 0) {
        product.images.forEach((img) => {
          if (!imagesList.includes(img.image_url)) {
            imagesList.push(img.image_url);
          }
        });
      }

      setAllImages(imagesList);

      // Set initial main image
      if (imagesList.length > 0) {
        setActiveImage(imagesList[0]);
      } else {
        setActiveImage("");
      }

      // Set initial bid amount
      const nextBid = (product.current_price || product.start_price) + (product.step_price || 10);
      setBidAmount(nextBid);
    }
  }, [product]);

  if (!product) return null;

  // Helper: Open Modal logic
  const openModal = (imgSrc) => {
    setActiveImage(imgSrc);
    setIsModalOpen(true);
  };

  // Helper: Time Remaining
  const getTimeRemaining = (endTime) => {
    const now = Date.now();
    const end = Date.parse(endTime);
    const total = end - now;

    if (total <= 0) return "Closed";

    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((total / (1000 * 60)) % 60);

    if (days < 3) {
      return `${days}d ${hours}h ${minutes}m`;
    }
    return new Date(endTime).toLocaleString();
  };

  // Helper: Mask Name
  const maskName = (name) => {
    if (!name) return "***";
    if (name.length <= 3) return "***" + name;
    return "***" + name.slice(-3);
  };

  // Helper: Format Date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  // Helper: Render Stars
  const renderStars = (filledCount = 0) => (
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

  return (
    <div className="flex-grow bg-white p-0 font-sans text-[#1f1f1f]">
      {/* Breadcrumbs - Compact */}
      <div className="flex items-center gap-2 text-sm mb-4 text-gray-500">
        <span>Home</span> <span className="text-gray-400">/</span>
        <span>Auctions</span> <span className="text-gray-400">/</span>
        <span className="text-black font-medium truncate max-w-[200px]">{product.name}</span>
      </div>

      {/* Main Grid Layout - Fixed Height for Desktop to avoid Scroll */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 lg:h-[500px]">

        {/* === LEFT: IMAGES === */}
        <div className="flex flex-col h-full gap-4">

          {/* Main Image Display - STRICT FIXED HEIGHT & WIDTH */}
          <div className="w-full h-[400px] bg-[#F5F5F5] rounded-xl flex items-center justify-center p-6 shadow-sm relative overflow-hidden">
            {activeImage ? (
              <img
                src={activeImage}
                className="w-full h-full object-contain"
                alt={product.name}
              />
            ) : (
              <div className="text-gray-400">No Image</div>
            )}
            {/* Status Badge */}
            <div className="absolute top-4 left-4 bg-[#AE9B84] text-white text-xs px-2 py-1 rounded shadow-md">
              {product.status === 'active' ? 'Live Auction' : product.status}
            </div>
          </div>

          {/* Thumbnails Row - STRICT FIXED SIZES */}
          <div className="flex gap-4 h-[80px] w-full mt-auto">
            {allImages.slice(0, MAX_THUMBNAILS).map((img, idx) => {
              const isLast = idx === MAX_THUMBNAILS - 1;
              const remaining = allImages.length - MAX_THUMBNAILS;

              // Standard Thumbnail
              if (!isLast || remaining <= 0) {
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`
                                w-[80px] h-[80px] rounded-lg bg-[#F5F5F5] shadow-sm 
                                flex items-center justify-center cursor-pointer p-2 transition-all
                                border-2 ${activeImage === img ? "border-[#AE9B84]" : "border-transparent hover:border-gray-300"}
                            `}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-contain" />
                  </div>
                );
              }

              // Last Thumbnail with "+N" Overlay
              return (
                <div
                  key={idx}
                  onClick={() => setIsModalOpen(true)}
                  className="w-[80px] h-[80px] rounded-lg bg-[#F5F5F5] shadow-sm relative cursor-pointer overflow-hidden group"
                >
                  <img src={img} alt="thumb" className="w-full h-full object-contain opacity-50 group-hover:scale-110 transition-transform p-2" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white font-bold text-lg">
                    +{remaining + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* === RIGHT: INFO === */}
        <div className="flex flex-col h-full overflow-hidden">

          {/* Title: clamped to 2 lines */}
          <h1 className="text-2xl font-bold leading-tight mb-2 line-clamp-2" title={product.name}>
            {product.name}
          </h1>

          {/* Rating & Views */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {renderStars(product.seller?.rating || 4)}
            <span className="text-sm text-gray-500">
              ({product.seller?.reviews_count || product.view_count || 120} reviews)
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-[#1f1f1f] text-sm font-medium">
              Seller: {product.seller?.full_name || "StyleLoom Seller"}
            </span>
          </div>

          {/* Price */}
          <div className="mb-6 p-4 bg-[#F9F9F9] rounded-lg border border-gray-100">
            {/* Current Price & Highest Bidder */}
            <div className="flex items-end gap-3 mb-2 flex-wrap">
              <span className="text-4xl font-bold text-[#1f1f1f]">
                ${product.current_price?.toLocaleString()}
              </span>
              <div className="mb-2 text-sm text-gray-500 font-medium bg-gray-200 px-2 py-0.5 rounded">
                Highest Bidder: {maskName(product.current_bidder?.full_name || product.bids?.[0]?.bidder?.full_name)}
              </div>
            </div>

            {/* Buy Now Price */}
            <div className="text-sm text-[#AE9B84] font-semibold mb-3">
              {product.buy_now_price
                ? `Buy Now Price: $${Number(product.buy_now_price).toLocaleString()}`
                : "No Buy Now Price"
              }
            </div>

            {/* Time Details */}
            <div className="flex flex-col gap-1 text-xs text-gray-500 border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between">
                <span>Posted:</span>
                <span className="font-mono">{formatDate(product.created_at || product.start_time)}</span>
              </div>
              <div className="flex justify-between">
                <span>Ends:</span>
                <span className="font-mono">{formatDate(product.end_time)}</span>
              </div>
              {/* Countdown for Guests (and everyone) */}
              <div className="flex justify-between text-[#AE9B84] font-bold mt-1">
                <span>Time Left:</span>
                <span>{getTimeRemaining(product.end_time)}</span>
              </div>
            </div>
          </div>

          {/* Description: Scrollable area if too long */}
          <div className="flex-1 overflow-y-auto pr-2 mb-4 text-sm text-gray-600 border-b border-gray-100 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
            <h3 className="font-bold text-black mb-1">Description</h3>
            <div dangerouslySetInnerHTML={{ __html: product.description }} />
          </div>

          {/* Bidding Section (Fixed at Bottom) */}
          <div className="mt-auto pt-2">
            {/* Bid Controls */}
            {!isAuthenticated ? (
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-[#AE9B84] text-white h-[48px] mt-2 rounded-lg font-medium hover:bg-[#9c8a74] transition"
              >
                Login to Bid
              </button>
            ) : (
              <div className="flex gap-3 h-[48px] mt-2">
                <div className="flex flex-1 border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setBidAmount(Math.max((product.current_price + product.step_price), bidAmount - product.step_price))}
                    className="w-[48px] bg-gray-50 hover:bg-gray-100 text-xl text-gray-600 border-r"
                  >
                    -
                  </button>
                  <input
                    type="text"
                    value={`$${bidAmount}`}
                    readOnly
                    className="flex-1 text-center font-bold text-[#1f1f1f] border-none outline-none"
                  />
                  <button
                    onClick={() => {
                      const nextVal = bidAmount + product.step_price;
                      // If adding step price exceeds buy now price, cap it at buy now price
                      if (product.buy_now_price && nextVal > product.buy_now_price) {
                        setBidAmount(product.buy_now_price);
                      } else {
                        setBidAmount(nextVal);
                      }
                    }}
                    className="w-[48px] bg-gray-50 hover:bg-gray-100 text-xl text-gray-600 border-l"
                  >
                    +
                  </button>
                </div>
                <button className="bg-[#AE9B84] text-white px-8 rounded-lg font-bold hover:bg-[#9c8a74] transition shadow-md">
                  BID
                </button>
                <button
                  onClick={handleToggleWatchlist}
                  className={`
                        w-[48px] h-[48px] rounded-lg flex items-center justify-center transition border
                        ${isWatchlisted ? 'bg-[#AE9B84] border-[#AE9B84] text-white' : 'border-gray-300 hover:bg-gray-50 text-gray-400'}
                    `}
                  title={isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill={isWatchlisted ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* === IMAGE MODAL === */}
      {
        isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="max-w-4xl w-full max-h-screen flex flex-col items-center">
              <img
                src={activeImage}
                alt="Full View"
                className="max-h-[80vh] object-contain mb-4"
              />
              <div className="flex gap-2 overflow-x-auto py-2 max-w-full">
                {allImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-16 h-16 flex-none rounded border-2 cursor-pointer bg-black ${activeImage === img ? "border-white" : "border-transparent opacity-60"}`}
                  >
                    <img src={img} className="w-full h-full object-contain" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      }

    </div >
  );
};

export default Product;
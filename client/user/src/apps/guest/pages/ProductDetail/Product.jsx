import React, { useState, useEffect } from "react";
import { useAuth } from "@context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../../components/ui/Toast";

const Product = ({ product, onRefresh }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [activeImage, setActiveImage] = useState("");
  const [allImages, setAllImages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState(0);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [placingBid, setPlacingBid] = useState(false);
  const [isSimulatedAutoBid, setIsSimulatedAutoBid] = useState(false);
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
      const currentPrice = Number(product.current_price || 0);
      // User Request: Initial display must be exactly the Highest Price (Current Price)
      setBidAmount(currentPrice);
    }
  }, [product]);

  if (!product) return null;

  // Constants to use in render
  // Reviews Logic
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [sellerReviews, setSellerReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const fetchSellerReviews = async () => {
    setIsReviewsModalOpen(true);
    if (sellerReviews.length > 0) return; // Cache simple

    setLoadingReviews(true);
    try {
      const sellerId = product.seller?.user_id || product.seller_id;
      // Note: Backend endpoint should be public
      const res = await fetch(`${API_URL}/api/ratings/user/${sellerId}`);
      if (res.ok) {
        const data = await res.json();
        setSellerReviews(data);
      }
    } catch (err) {
      console.error("Failed to fetch reviews");
    } finally {
      setLoadingReviews(false);
    }
  };

  const currentPrice = Number(product.current_price || 0);
  const stepPrice = Number(product.step_price || 0);
  // const startPrice = Number(product.start_price || 0);
  const buyNowPrice = product.buy_now_price ? Number(product.buy_now_price) : null;

  // Logic: 
  // - Input Floor: currentPrice (User wants to see leading price)
  // - Submit Floor: 
  //    If bid_count == 0, Submit >= currentPrice.
  //    If bid_count > 0, Submit >= currentPrice + stepPrice.

  const inputFloor = currentPrice;
  const submitFloor = product.bid_count > 0 ? (currentPrice + stepPrice) : currentPrice;

  // Helper: Open Modal logic
  const openModal = (imgSrc) => {
    setActiveImage(imgSrc);
    setIsModalOpen(true);
  };

  const handlePrevImage = () => {
    const idx = allImages.indexOf(activeImage);
    const prevIdx = (idx - 1 + allImages.length) % allImages.length;
    setActiveImage(allImages[prevIdx]);
  };

  const handleNextImage = () => {
    const idx = allImages.indexOf(activeImage);
    const nextIdx = (idx + 1) % allImages.length;
    setActiveImage(allImages[nextIdx]);
  };

  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") handlePrevImage();
      if (e.key === "ArrowRight") handleNextImage();
      if (e.key === "Escape") setIsModalOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, activeImage, allImages]);

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

  const handleBid = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    // Final Client-Side Validation
    if (product.status !== 'active') {
      addToast("This auction is not active.", "error");
      return;
    }

    if (isSimulatedAutoBid) {
      // Proceed to server request
      // addToast(`Auto Bidding set to maximum $${bidAmount} successfully!`, "success"); // Removed Client-Side only msg
    }

    setPlacingBid(true);
    try {
      const res = await fetch(`${API_URL}/api/products/${product.product_id}/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(
          isSimulatedAutoBid
            ? { max_amount: bidAmount, isAutoBid: true }
            : { amount: bidAmount }
        )
      });
      const data = await res.json();

      if (res.ok) {
        addToast("Success! Bid placed.", "success");
        setIsSimulatedAutoBid(false);
        if (onRefresh) onRefresh();
      } else {
        addToast(data.message || "Failed to place bid", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Network error. Please try again.", "error");
    } finally {
      setPlacingBid(false);
    }
  };

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
            <div className={`absolute top-4 left-4 text-white text-xs px-2 py-1 rounded shadow-md font-semibold
              ${product.status === 'active' ? 'bg-[#AE9B84]' :
                product.status === 'sold' ? 'bg-[#C1A27D]' :
                  product.status === 'ended_no_winner' ? 'bg-gray-500' : 'bg-red-500'
              }`}>
              {
                product.status === 'active' ? 'Live Auction'
                  : product.status === 'sold' ? 'Sold'
                    : product.status === 'ended_no_winner' ? 'Ended / No Winner'
                      : product.status
              }
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
            {renderStars(Number(product.seller?.avg_rating || 0))}
            <span
              onClick={fetchSellerReviews}
              className="text-sm text-gray-500 hover:text-[#AE9B84] cursor-pointer transition font-medium underline decoration-dotted"
            >
              ({product.seller?.total_ratings || 0} reviews)
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-[#1f1f1f] text-sm font-medium">
              Seller: {product.seller?.full_name || "Unknown Seller"}
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
                    onClick={() => {
                      if (isSimulatedAutoBid && bidAmount <= inputFloor) {
                        setIsSimulatedAutoBid(false);
                        setBidAmount(buyNowPrice || inputFloor);
                      } else {
                        setBidAmount(Math.max(inputFloor, bidAmount - stepPrice));
                      }
                    }}
                    className={`w-[48px] bg-gray-50 text-xl text-gray-600 border-r hover:bg-gray-100`}
                  >
                    -
                  </button>
                  <input
                    type="text"
                    value={isSimulatedAutoBid ? `Auto Bidding: $${bidAmount.toLocaleString()}` : `$${bidAmount.toLocaleString()}`}
                    readOnly
                    className={`flex-1 text-center font-bold border-none outline-none bg-white ${isSimulatedAutoBid ? 'text-[#AE9B84] text-xs' : 'text-[#1f1f1f] text-base'}`}
                  />
                  <button
                    onClick={() => {
                      const nextVal = bidAmount + stepPrice;
                      if (!isSimulatedAutoBid) {
                        // Manual Mode
                        if (buyNowPrice && nextVal > buyNowPrice) {
                          setIsSimulatedAutoBid(true);
                          setBidAmount(inputFloor);
                        } else {
                          setBidAmount(nextVal);
                        }
                      } else {
                        // Auto Mode
                        if (buyNowPrice && nextVal > buyNowPrice) {
                          setBidAmount(buyNowPrice);
                        } else {
                          setBidAmount(nextVal);
                        }
                      }
                    }}
                    className={`w-[48px] bg-gray-50 text-xl text-gray-600 border-l ${(isSimulatedAutoBid && buyNowPrice && bidAmount >= buyNowPrice) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleBid}
                  disabled={placingBid || product.status !== 'active' || bidAmount < submitFloor}
                  className={`px-8 rounded-lg font-bold shadow-md transition ${(product.status !== 'active' || bidAmount < submitFloor) ? 'bg-[#E5DFD5] text-gray-400 cursor-not-allowed' : 'bg-[#AE9B84] hover:bg-[#9c8a74] text-white'}`}
                >
                  {placingBid ? "..." : "BID"}
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
          <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-[60] text-white/70 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Left Nav Button */}
            {allImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-[60] bg-white/10 hover:bg-white/20 text-white rounded-full p-3 backdrop-blur-sm transition-all hover:scale-110"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
            )}

            {/* Right Nav Button */}
            {allImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-[60] bg-white/10 hover:bg-white/20 text-white rounded-full p-3 backdrop-blur-sm transition-all hover:scale-110"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            )}

            <div className="max-w-5xl w-full max-h-screen flex flex-col items-center relative">
              <img
                key={activeImage} // Triggers animation on change
                src={activeImage}
                alt="Full View"
                className="max-h-[80vh] w-full object-contain mb-6 animate-fadeIn select-none"
              />

              <div className="flex gap-3 overflow-x-auto py-2 px-4 max-w-full scrollbar-hide">
                {allImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`
                      w-16 h-16 flex-none rounded-lg border-2 cursor-pointer transition-all duration-300
                      ${activeImage === img ? "border-[#AE9B84] scale-110 opacity-100 ring-2 ring-[#AE9B84]/50" : "border-transparent opacity-50 hover:opacity-100 hover:scale-105"}
                    `}
                  >
                    <img src={img} className="w-full h-full object-cover rounded-md" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      }

      {isReviewsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b flex justify-between items-center bg-white sticky top-0 z-10">
              <h3 className="font-bold text-xl text-[#1f1f1f]">Seller Reviews</h3>
              <button
                onClick={() => setIsReviewsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingReviews ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#AE9B84]"></div>
                </div>
              ) : sellerReviews.length === 0 ? (
                <div className="text-center py-10 text-gray-400 italic">No reviews yet for this seller.</div>
              ) : (
                sellerReviews.map((review) => (
                  <div key={review.rating_id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">
                          {review.rater?.full_name ? review.rater.full_name.charAt(0).toUpperCase() : "?"}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-[#1f1f1f]">
                            {review.rater?.full_name || 'Anonymous'}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(review.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className={`px-3 py-1 rounded-full text-xs font-bold border ${review.rating_value > 0 ? 'bg-[#F4EBE2] text-[#AE9B84] border-[#AE9B84]/30' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {review.rating_value > 0 ? "Recommended" : "Not Recommended"}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mt-2 pl-[52px]">
                      {review.comment || <span className="italic text-gray-400">No comment provided.</span>}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div >
  );
};

export default Product;
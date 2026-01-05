import React, { useState, useEffect } from "react";
import { useAuth } from "@context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../../../components/ui/Toast";

const Product = ({ product, onRefresh }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [activeImage, setActiveImage] = useState("");
  const [allImages, setAllImages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Bidding State
  const [bidAmount, setBidAmount] = useState("");
  const [placingBid, setPlacingBid] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  
  // Reviews State
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [sellerReviews, setSellerReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const token = localStorage.getItem('token');
  const API_URL = import.meta.env.VITE_API_URL;
  const MAX_THUMBNAILS = 4;

  if (!product) return null;

  // 1. CALCULATE VALUES
  const isOwner = isAuthenticated && user && product.seller_id && 
    (Number(user.user_id) === Number(product.seller_id));

  const bidCount = product.bid_count || 0;
  const currentPrice = Number(product.current_price || 0);
  const startPrice = Number(product.start_price || 0);
  const stepPrice = Number(product.step_price) || 10;
  const buyNowPrice = product.buy_now_price ? Number(product.buy_now_price) : null;

  const minValidBid = bidCount > 0 
    ? currentPrice + stepPrice 
    : startPrice;

  // 2. INITIALIZE STATE
  useEffect(() => {
    if (product) {
      const imagesList = [];
      if (product.main_image_url) imagesList.push(product.main_image_url);
      if (product.images?.length > 0) {
        product.images.forEach((img) => {
          const url = typeof img === 'string' ? img : img.image_url;
          if (url && !imagesList.includes(url)) imagesList.push(url);
        });
      }
      setAllImages(imagesList);
      if (imagesList.length > 0 && !activeImage) setActiveImage(imagesList[0]);

      const initialValue = bidCount > 0 ? currentPrice : startPrice;
      setBidAmount(initialValue);
      
      // Watchlist
      if (token) {
        fetch(`${API_URL}/api/watchlist`, { headers: { 'Authorization': `Bearer ${token}` } })
          .then(res => res.ok ? res.json() : [])
          .then(data => setIsWatchlisted(!!data.find(i => i.product_id === product.product_id)))
          .catch(() => {});
      }
    }
  }, [product, token, API_URL]); 

  const handleBidChange = (val) => {
    if (val === '') { setBidAmount(''); return; }
    setBidAmount(val);
  };

  const adjustBid = (direction) => {
    const currentVal = Number(bidAmount) || (bidCount > 0 ? currentPrice : startPrice);
    
    if (direction === 'up') {
        if (currentVal < minValidBid) {
            setBidAmount(minValidBid);
        } else {
            setBidAmount(currentVal + stepPrice);
        }
    } else {
        const newVal = currentVal - stepPrice;
        setBidAmount(Math.max(minValidBid, newVal));
    }
  };

  const handleBid = async () => {
    if (!token) return navigate('/login');
    if (product.status !== 'active') return addToast("Auction is not active", "error");
    
    const amount = Number(bidAmount);

    // Final Validation
    if (amount < minValidBid) {
        addToast(`Bid too low. Minimum required: $${minValidBid.toLocaleString()}`, "error");
        return;
    }

    if (buyNowPrice && amount > buyNowPrice) {
        addToast(`Bid cannot exceed Buy Now price ($${buyNowPrice})`, "error");
        return;
    }

    setPlacingBid(true);
    try {
      const res = await fetch(`${API_URL}/api/products/${product.product_id}/bid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      
      if (res.ok) {
        addToast("Success! You are the highest bidder.", "success");
        if (onRefresh) onRefresh(); 
        else window.location.reload();
      } else {
        addToast(data.message || "Failed to place bid", "error");
      }
    } catch (e) {
      addToast("Network Error", "error");
    } finally {
      setPlacingBid(false);
    }
  };

  const handleToggleWatchlist = async () => {
    if (!isAuthenticated) return navigate("/login");
    setIsWatchlisted(prev => !prev);
    try {
      const method = isWatchlisted ? 'DELETE' : 'POST';
      const url = isWatchlisted ? `${API_URL}/api/watchlist/${product.product_id}` : `${API_URL}/api/watchlist`;
      await fetch(url, {
        method, 
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: !isWatchlisted ? JSON.stringify({ product_id: product.product_id }) : undefined
      });
    } catch (e) { setIsWatchlisted(prev => !prev); }
  };

  const fetchSellerReviews = async () => {
    setIsReviewsModalOpen(true);
    if (sellerReviews.length > 0) return;
    setLoadingReviews(true);
    try {
      const res = await fetch(`${API_URL}/api/ratings/user/${product.seller_id}`);
      if (res.ok) setSellerReviews(await res.json());
    } catch (e) {} finally { setLoadingReviews(false); }
  };

  const getTimeRemaining = (endTime) => {
    const total = Date.parse(endTime) - Date.now();
    if (total <= 0) return "Closed";
    const d = Math.floor(total / (1000 * 60 * 60 * 24));
    const h = Math.floor((total / (1000 * 60 * 60)) % 24);
    const m = Math.floor((total / (1000 * 60)) % 60);
    return d < 3 ? `${d}d ${h}h ${m}m` : new Date(endTime).toLocaleDateString();
  };

  const renderStars = (filledCount = 0) => (
    <div className="flex text-[#FFAD33] text-sm">
      {[...Array(5)].map((_, index) => (
        <svg key={index} className={`w-4 h-4 fill-current ${index < filledCount ? "" : "text-gray-300"}`} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  const maskName = (name) => {
    if (!name) return "***";
    if (name.length <= 3) return "***" + name;
    return "***" + name.slice(-3);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-grow bg-white p-0 font-sans text-[#1f1f1f]">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm mb-4 text-gray-500">
        <span>Home</span> <span className="text-gray-400">/</span>
        <span>Auctions</span> <span className="text-gray-400">/</span>
        <span className="text-black font-medium truncate max-w-[200px]">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 lg:h-[500px]">
        {/* LEFT: IMAGES */}
        <div className="flex flex-col h-full gap-4">
          <div className="w-full h-[400px] bg-[#F5F5F5] rounded-xl flex items-center justify-center p-6 shadow-sm relative overflow-hidden">
            {activeImage ? <img src={activeImage} className="w-full h-full object-contain" alt="main" /> : <div className="text-gray-400">No Image</div>}
            <div className={`absolute top-4 left-4 text-white text-xs px-2 py-1 rounded shadow-md font-semibold ${product.status === 'active' ? 'bg-[#AE9B84]' : 'bg-gray-500'}`}>
              {product.status === 'active' ? 'Live Auction' : product.status}
            </div>
          </div>
          <div className="flex gap-4 h-[80px] w-full mt-auto">
            {allImages.slice(0, MAX_THUMBNAILS).map((img, idx) => (
              <div key={idx} onClick={() => idx < 3 ? setActiveImage(img) : setIsModalOpen(true)} className={`w-[80px] h-[80px] rounded-lg bg-[#F5F5F5] flex items-center justify-center cursor-pointer p-2 border-2 ${activeImage === img ? "border-[#AE9B84]" : "border-transparent"} ${idx === 3 ? "relative" : ""}`}>
                <img src={img} className={`w-full h-full object-contain ${idx === 3 ? "opacity-50" : ""}`} />
                {idx === 3 && <div className="absolute inset-0 flex items-center justify-center font-bold">+{allImages.length - 3}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: INFO */}
        <div className="flex flex-col h-full overflow-hidden">
          <h1 className="text-2xl font-bold mb-2 line-clamp-2">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            {renderStars(Number(product.seller?.avg_rating || 0))}
            <span onClick={fetchSellerReviews} className="text-sm underline cursor-pointer hover:text-[#AE9B84]">({product.seller?.total_ratings || 0} reviews)</span>
            <span className="text-sm ml-2 text-gray-400">| Seller: {product.seller?.full_name || "Unknown"}</span>
          </div>

          <div className="mb-6 p-4 bg-[#F9F9F9] rounded-lg border border-gray-100">
            <div className="flex items-end gap-3 mb-2">
              <span className="text-4xl font-bold text-[#1f1f1f]">${currentPrice.toLocaleString()}</span>
              {product.current_bidder && <span className="text-xs bg-gray-200 px-2 py-1 rounded">Highest: ***{product.current_bidder.full_name?.slice(-3)}</span>}
            </div>
            {buyNowPrice && <div className="text-sm text-[#AE9B84] font-semibold mb-2">Buy Now: ${buyNowPrice.toLocaleString()}</div>}
            <div className="flex justify-between text-xs text-gray-500 border-t pt-2 mt-2">
               <span>Ends: {new Date(product.end_time).toLocaleDateString()}</span>
               <span className="text-[#AE9B84] font-bold">{getTimeRemaining(product.end_time)}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto mb-4 text-sm text-gray-600 border-b pb-4 scrollbar-thin" dangerouslySetInnerHTML={{ __html: product.description }} />

          {/* BIDDING SECTION */}
          <div className="mt-auto pt-2">
            {!isAuthenticated ? (
              <button onClick={() => navigate("/login")} className="w-full bg-[#AE9B84] text-white h-[48px] rounded-lg font-bold hover:bg-[#9c8a74]">Login to Bid</button>
            ) : isOwner ? (
              <div className="w-full bg-yellow-50 text-yellow-800 h-[48px] rounded-lg font-medium border border-yellow-200 flex items-center justify-center">You are the seller of this item.</div>
            ) : (
              <div className="flex flex-col gap-1">
                <div className="flex gap-3 h-[48px]">
                  <div className="flex flex-1 border border-gray-300 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-[#AE9B84]">
                    <button 
                      onClick={() => adjustBid('down')} 
                      className="w-12 bg-gray-50 border-r hover:bg-gray-100 text-xl text-gray-600 font-medium"
                      disabled={Number(bidAmount) <= minValidBid}
                    >
                      -
                    </button>
                    <div className="flex-1 flex items-center justify-center bg-white relative">
                        <span className="text-gray-500 font-bold ml-2">$</span>
                        <input 
                            type="number" 
                            value={bidAmount} 
                            onChange={(e) => handleBidChange(e.target.value)}
                            className="w-full h-full text-center font-bold border-none outline-none text-[#1f1f1f] bg-transparent p-0"
                            placeholder={minValidBid}
                        />
                    </div>
                    <button 
                      onClick={() => adjustBid('up')} 
                      className="w-12 bg-gray-50 border-l hover:bg-gray-100 text-xl text-gray-600 font-medium"
                    >
                      +
                    </button>
                  </div>
                  <button 
                    onClick={handleBid} 
                    disabled={placingBid || product.status !== 'active' || (Number(bidAmount) < minValidBid)} 
                    className={`px-6 rounded-lg font-bold shadow-sm transition-all
                        ${(placingBid || product.status !== 'active' || Number(bidAmount) < minValidBid) 
                            ? 'bg-[#E5DFD5] text-gray-400 cursor-not-allowed' 
                            : 'bg-[#AE9B84] hover:bg-[#9c8a74] text-white shadow-md'
                        }
                    `}
                  >
                    {placingBid ? "..." : "BID"}
                  </button>
                  <button onClick={handleToggleWatchlist} className={`w-[48px] rounded-lg flex items-center justify-center border transition ${isWatchlisted ? 'bg-[#AE9B84] border-[#AE9B84] text-white' : 'border-gray-300 hover:bg-gray-50 text-gray-400'}`}>
                     <svg xmlns="http://www.w3.org/2000/svg" fill={isWatchlisted ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
                  </button>
                </div>
                <div className="flex justify-between text-xs text-gray-500 px-1">
                    <span>Step: <strong>${stepPrice.toLocaleString()}</strong></span>
                    {Number(bidAmount) < minValidBid && (
                        <span className="text-[#AE9B84] font-medium animate-pulse">Min Bid: ${minValidBid.toLocaleString()}</span>
                    )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals remain the same */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
           <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 z-[60] text-white/70 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
           <img src={activeImage} className="max-h-[90vh] max-w-full object-contain" onClick={e => e.stopPropagation()} />
        </div>
      )}
      
      {isReviewsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
           <div className="bg-white p-6 rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto relative">
              <button onClick={() => setIsReviewsModalOpen(false)} className="absolute top-4 right-4 font-bold text-gray-400 hover:text-gray-600">✕</button>
              <h3 className="font-bold text-xl mb-4 text-[#1f1f1f]">Seller Reviews</h3>
              {loadingReviews ? "Loading..." : sellerReviews.length === 0 ? "No reviews yet." : sellerReviews.map(r => (
                  <div key={r.rating_id} className="border-b py-3 last:border-0">
                      <div className="font-bold text-[#1f1f1f]">{r.rater?.full_name || 'User'} <span className="font-normal text-xs text-gray-400 ml-2">{new Date(r.created_at).toLocaleDateString()}</span></div>
                      <div className="text-sm mt-1 text-gray-600">{r.comment}</div>
                  </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default Product;
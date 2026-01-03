import React, { useState, useEffect } from "react";
import { useAuth } from "@context/AuthContext";
import { useNavigate } from "react-router-dom";

const Product = ({ product, isOwner, onBidSuccess }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // State
  const [activeImage, setActiveImage] = useState("");
  const [allImages, setAllImages] = useState([]);
  const [bidAmount, setBidAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (product) {
      const imagesList = [];
      if (product.main_image_url) imagesList.push(product.main_image_url);
      
      if (product.images && product.images.length > 0) {
        product.images.forEach((img) => {
            const url = typeof img === 'string' ? img : img.image_url;
            if (url && !imagesList.includes(url)) {
                imagesList.push(url);
            }
        });
      }

      setAllImages(imagesList);
      if (imagesList.length > 0) setActiveImage(imagesList[0]);

      // 2. Suggest Next Bid
      // Use current_price (which updates after ban)
      const current = parseFloat(product.current_price || product.start_price);
      const step = parseFloat(product.step_price || 10);
      setBidAmount(current + step);
    }
  }, [product]);

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return navigate("/login");

    try {
      setLoading(true);
      setMessage(null);
      const token = localStorage.getItem("token");
      
      const res = await fetch(`${API_URL}/api/products/${product.product_id}/bid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount: parseFloat(bidAmount) })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage({ type: "success", text: "Bid placed successfully!" });
      if (onBidSuccess) onBidSuccess(); 

    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  const getWinnerName = () => {
    if (product.current_bidder?.full_name) {
        return product.current_bidder.full_name;
    }
    return "No Bids";
  };

  return (
    <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* --- LEFT: GALLERY --- */}
        <div className="flex flex-col gap-4">
          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 border flex items-center justify-center relative">
             <img 
                src={activeImage} 
                alt={product.name} 
                className="w-full h-full object-contain"
             />
             <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {allImages.indexOf(activeImage) + 1} / {allImages.length}
             </div>
          </div>

          <div className="grid grid-cols-5 gap-2">
             {allImages.map((img, idx) => (
                <div 
                    key={idx} 
                    onClick={() => setActiveImage(img)}
                    className={`
                        aspect-square rounded-lg overflow-hidden bg-gray-50 cursor-pointer 
                        border-2 transition-all
                        ${activeImage === img ? "border-[#AD9C86] opacity-100" : "border-transparent opacity-60 hover:opacity-100"}
                    `}
                >
                   <img src={img} className="w-full h-full object-cover" alt={`view ${idx}`} />
                </div>
             ))}
          </div>
        </div>

        {/* --- RIGHT: INFO & BIDDING --- */}
        <div className="flex flex-col gap-6">
           <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-sm text-gray-500">
                 Seller: <span className="font-semibold text-black">{product.seller?.full_name || "Unknown"}</span>
              </p>
           </div>

           <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <div className="flex justify-between items-end mb-4">
                 <div>
                    <p className="text-sm text-gray-500 font-medium">Current Price</p>
                    <p className="text-4xl font-bold text-[#AD9C86]">${parseFloat(product.current_price).toLocaleString()}</p>
                 </div>
                 
                 <div className="text-right">
                    <p className="text-sm text-gray-500 font-medium">Highest Bidder</p>
                    <p className="text-lg font-bold text-gray-800">{getWinnerName()}</p>
                 </div>
              </div>
              
              {product.buy_now_price && (
                 <div className="mb-4 text-right">
                    <span className="text-sm text-gray-500 mr-2">Buy Now:</span>
                    <span className="text-md font-bold text-gray-700">${parseFloat(product.buy_now_price).toLocaleString()}</span>
                 </div>
              )}

              {message && (
                <div className={`p-3 rounded-lg text-sm mb-4 ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message.text}
                </div>
              )}

              {/* Bidding Controls */}
              {product.status === 'active' && !isOwner && (
                  <form onSubmit={handlePlaceBid} className="flex gap-3">
                     <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                        <input 
                            type="number" 
                            step="0.01"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#AD9C86] outline-none font-bold"
                            required
                        />
                     </div>
                     <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-[#AD9C86] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#968672] transition shadow-md disabled:opacity-50"
                     >
                        {loading ? "..." : "Place Bid"}
                     </button>
                  </form>
              )}
              
              {isOwner && (
                  <div className="text-center p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm font-medium">
                      You are the seller of this item.
                  </div>
              )}
           </div>

           <div className="prose text-sm text-gray-600">
              <h3 className="text-black font-bold mb-2">Description</h3>
              <div dangerouslySetInnerHTML={{ __html: product.description }} />
           </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Panel from "@shared/components/Panel";
import VBox from "@shared/components/VBox";
import HBox from "@shared/components/HBox";
import ProductCard from "./ProductCard";
import Pagination from "./Pagination";

const API_URL = import.meta.env.VITE_API_URL;

const MyProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active"); // 'active' | 'sold'

  // Rating Modal State
  const [showRateModal, setShowRateModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null); // Which product we are rating
  const [ratingValue, setRatingValue] = useState(1);
  const [ratingComment, setRatingComment] = useState("");

  const fetchMyProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/products/seller/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setProducts(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
  }, []);

  // --- ACTIONS ---

  const handleCancelTransaction = async (productId) => {
    if (!confirm("Cancel transaction? This will automatically rate the winner -1.")) return;
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/products/${productId}/cancel`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to cancel");
        alert("Transaction cancelled.");
        fetchMyProducts(); // Refresh list
    } catch (err) {
        alert(err.message);
    }
  };

  const handleRateSubmit = async () => {
    if (!selectedProduct) return;
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/ratings`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({
                product_id: selectedProduct.product_id,
                rated_user_id: selectedProduct.winner_id,
                rating_value: ratingValue,
                comment: ratingComment
            })
        });

        if (!res.ok) throw new Error("Failed to submit rating");
        alert("Rating submitted!");
        setShowRateModal(false);
        fetchMyProducts();
    } catch (err) {
        alert(err.message);
    }
  };

  const openRateModal = (product) => {
    setSelectedProduct(product);
    setRatingValue(1);
    setRatingComment("");
    setShowRateModal(true);
  };

  // --- FILTER LOGIC ---
  const displayedProducts = products.filter(p => {
    const hasWinner = !!p.winner_id;
    // 'active' tab: Active status OR (Ended but NO winner)
    // 'sold' tab: Has winner
    if (activeTab === "active") return p.status === 'active' || (p.status !== 'active' && !hasWinner);
    if (activeTab === "sold") return hasWinner;
    return false;
  });

  return (
    <div className="p-10 relative">
      <Panel className="p-6">
        <VBox className="gap-6">
          
          {/* Header & Tabs */}
          <div className="flex justify-between items-center border-b pb-4">
            <div className="flex gap-6">
                <button 
                    onClick={() => setActiveTab("active")}
                    className={`text-lg font-bold pb-2 border-b-2 ${activeTab === 'active' ? 'border-[#AD9C86] text-black' : 'border-transparent text-gray-400'}`}
                >
                    Currently Posted
                </button>
                <button 
                    onClick={() => setActiveTab("sold")}
                    className={`text-lg font-bold pb-2 border-b-2 ${activeTab === 'sold' ? 'border-[#AD9C86] text-black' : 'border-transparent text-gray-400'}`}
                >
                    Sold / Winning
                </button>
            </div>

            <button 
              onClick={() => navigate("/seller/products/new")}
              className="bg-primary/60 px-4 py-2 rounded-xl font-semibold hover:bg-primary/80"
            >
              + New Product
            </button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {displayedProducts.map((p) => (
              <div key={p.product_id} className="relative group">
                 {/* Reusing ProductCard but wrapping it to add Sold Actions */}
                 <ProductCard 
                    product={{
                        id: p.product_id,
                        name: p.name,
                        price: `$${p.current_price || p.start_price}`,
                        image: p.main_image_url || "https://placehold.co/600x400",
                        status: p.status,
                        seller: "You"
                    }} 
                    mode="owner" 
                 />

                 {/* SOLD ACTIONS OVERLAY */}
                 {activeTab === "sold" && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg border text-sm">
                        <p className="font-bold mb-1">Winner: {p.winner?.full_name}</p>
                        
                        {/* If already rated, show status */}
                        {p.ratings && p.ratings.length > 0 ? (
                            <span className="text-green-600 text-xs font-bold">✓ Rated</span>
                        ) : (
                            <div className="flex gap-2 mt-2">
                                <button 
                                    onClick={() => openRateModal(p)}
                                    className="flex-1 bg-blue-100 text-blue-700 py-1 rounded hover:bg-blue-200"
                                >
                                    Rate
                                </button>
                                <button 
                                    onClick={() => handleCancelTransaction(p.product_id)}
                                    className="flex-1 bg-red-100 text-red-700 py-1 rounded hover:bg-red-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                 )}
              </div>
            ))}
          </div>
          
          {displayedProducts.length === 0 && !loading && (
             <p className="text-center text-gray-400 py-10">No products found in this tab.</p>
          )}

        </VBox>
      </Panel>

      {/* RATING MODAL */}
      {showRateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl w-[400px] shadow-2xl">
                <h3 className="text-xl font-bold mb-4">Rate Winner</h3>
                <p className="text-sm text-gray-500 mb-4">Winner: {selectedProduct?.winner?.full_name}</p>
                
                <div className="flex gap-4 mb-4">
                    <button 
                        onClick={() => setRatingValue(1)}
                        className={`flex-1 py-2 rounded-lg font-bold border ${ratingValue === 1 ? 'bg-green-100 border-green-500 text-green-700' : 'border-gray-200'}`}
                    >
                        👍 +1 Like
                    </button>
                    <button 
                        onClick={() => setRatingValue(-1)}
                        className={`flex-1 py-2 rounded-lg font-bold border ${ratingValue === -1 ? 'bg-red-100 border-red-500 text-red-700' : 'border-gray-200'}`}
                    >
                        👎 -1 Dislike
                    </button>
                </div>

                <textarea 
                    className="w-full border rounded-lg p-3 text-sm focus:ring-2 ring-[#AD9C86] outline-none mb-4"
                    rows="3"
                    placeholder="Write a comment..."
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                />

                <div className="flex justify-end gap-3">
                    <button onClick={() => setShowRateModal(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
                    <button onClick={handleRateSubmit} className="px-4 py-2 bg-[#AD9C86] text-white rounded-lg hover:bg-[#968672]">Submit Rating</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default MyProducts;
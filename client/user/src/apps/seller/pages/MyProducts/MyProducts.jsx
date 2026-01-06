import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Panel from "@shared/components/Panel";
import VBox from "@shared/components/VBox";
import HBox from "@shared/components/HBox";
import ProductCard from "./ProductCard";
import Pagination from "./Pagination";
import { useToast } from "../../../../components/ui/Toast";

const API_URL = import.meta.env.VITE_API_URL;

const MyProducts = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
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

  // --- CHAT STATE ---
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setConversations(await res.json());
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMessages = async (productId) => {
    setLoadingChat(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/messages/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMessages(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !selectedConversation) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/messages/${selectedConversation.productId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ messageText: currentMessage })
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages([...messages, { ...newMsg, sender: { full_name: "Me" } }]); // Optimistic append
        setCurrentMessage("");
      }
    } catch (err) {
      addToast("Failed to send message", "error");
    }
  };

  useEffect(() => {
    if (activeTab === 'messages') {
      fetchConversations();
    } else {
      fetchMyProducts();
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.productId);
      // Optional: Polling could go here
    }
  }, [selectedConversation]);


  // --- FILTER LOGIC ---
  const displayedProducts = products.filter(p => {
    const hasWinner = !!p.winner_id;
    if (activeTab === "active") return p.status === 'active' || (p.status !== 'active' && !hasWinner);
    if (activeTab === "sold") return hasWinner;
    return false;
  });

  return (
    <div className="p-10 relative h-[calc(100vh-64px)] flex flex-col">
      <Panel className="p-6 flex-1 flex flex-col min-h-0">
        <VBox className="gap-6 h-full">

          {/* Header & Tabs */}
          <div className="flex justify-between items-center border-b pb-4 shrink-0">
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
              <button
                onClick={() => setActiveTab("messages")}
                className={`text-lg font-bold pb-2 border-b-2 ${activeTab === 'messages' ? 'border-[#AD9C86] text-black' : 'border-transparent text-gray-400'}`}
              >
                Messages
              </button>
            </div>

            {activeTab !== 'messages' && (
              <button
                onClick={() => navigate("/seller/products/new")}
                className="bg-primary/60 px-4 py-2 rounded-xl font-semibold hover:bg-primary/80"
              >
                + New Product
              </button>
            )}
          </div>

          {/* CONTENT AREA */}
          {activeTab === 'messages' ? (
            <div className="flex flex-1 gap-6 min-h-0 overflow-hidden">
              {/* SIDEBAR: Conversation List */}
              <div className="w-1/3 border-r overflow-y-auto pr-4">
                {conversations.length === 0 ? (
                  <div className="text-gray-400 text-center mt-10">No messages yet.</div>
                ) : (
                  conversations.map(conv => (
                    <div
                      key={conv.transactionId}
                      onClick={() => setSelectedConversation(conv)}
                      className={`p-4 rounded-lg cursor-pointer mb-2 transition hover:bg-gray-50 border ${selectedConversation?.transactionId === conv.transactionId ? 'bg-[#F4EBE2] border-[#AD9C86]' : 'bg-white border-transparent'}`}
                    >
                      <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                          {conv.productImage && <img src={conv.productImage} className="w-full h-full object-cover" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate text-[#1f1f1f]">{conv.otherUser?.full_name || "User"}</p>
                          <p className="text-xs text-gray-500 truncate">{conv.productName}</p>
                          <p className="text-xs text-gray-400 truncate mt-1">
                            {conv.lastMessage?.message_text || "Attachment..."}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* MAIN: Chat Window */}
              <div className="flex-1 flex flex-col bg-gray-50 rounded-xl overflow-hidden border">
                {selectedConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 bg-white border-b flex justify-between items-center shadow-sm">
                      <div>
                        <h3 className="font-bold text-[#1f1f1f]">{selectedConversation.otherUser?.full_name}</h3>
                        <p className="text-xs text-gray-500">Re: {selectedConversation.productName}</p>
                      </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {loadingChat ? (
                        <div className="flex justify-center mt-10"><span className="animate-spin h-6 w-6 border-2 border-[#AD9C86] rounded-full border-t-transparent"></span></div>
                      ) : (
                        messages.map((msg, idx) => {
                          const isMe = msg.sender_id ? (msg.sender_id !== selectedConversation.otherUser?.user_id) : (msg.sender?.full_name === "Me");
                          // Simple check: if msg sender is NOT the 'otherUser', it's active user. 
                          // Or rely on auth userId if available in state? checking undefined might be risky.
                          // Better: check if msg.sender_id exists. Compare with token user ID?
                          // Actually API returns sender object. 
                          // Let's assume right-align if it is ME.
                          return (
                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${isMe ? 'bg-[#AD9C86] text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'}`}>
                                {msg.message_text}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t">
                      <form
                        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                        className="flex gap-2"
                      >
                        <input
                          type="text"
                          className="flex-1 border rounded-full px-4 py-2 outline-none focus:ring-2 ring-[#AD9C86]"
                          placeholder="Type a message..."
                          value={currentMessage}
                          onChange={(e) => setCurrentMessage(e.target.value)}
                        />
                        <button
                          type="submit"
                          className="bg-[#AD9C86] text-white px-6 py-2 rounded-full font-bold hover:bg-[#968672] transition"
                        >
                          Send
                        </button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-400">
                    Select a conversation to start chatting
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* REGULAR GRID CONTENT */
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-y-auto pr-2 pb-10">
              {displayedProducts.map((p) => (
                <div key={p.product_id} className="relative group">
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

                  {activeTab === "sold" && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg border text-sm">
                      <p className="font-bold mb-1">Winner: {p.winner?.full_name}</p>
                      {p.ratings && p.ratings.length > 0 ? (
                        <span className="text-green-600 text-xs font-bold">✓ Rated</span>
                      ) : (
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => openRateModal(p)} className="flex-1 bg-blue-100 text-blue-700 py-1 rounded hover:bg-blue-200">Rate</button>
                          <button onClick={() => handleCancelTransaction(p.product_id)} className="flex-1 bg-red-100 text-red-700 py-1 rounded hover:bg-red-200">Cancel</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {displayedProducts.length === 0 && !loading && (
                <div className="col-span-full text-center text-gray-400 py-10">No products found in this tab.</div>
              )}
            </div>
          )}

        </VBox>
      </Panel>
      {/* RATING MODAL code preserved below... */}
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
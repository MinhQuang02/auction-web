import { Link } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import Sidebar from "../../components/Sidebar";
import { useToast } from "../../../../components/ui/Toast";

const API_URL = import.meta.env.VITE_API_URL;

const MyPurchases = () => {
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Rating Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [ratingValue, setRatingValue] = useState(0); // 1 = Like, -1 = Dislike
  const [ratingComment, setRatingComment] = useState("");

  // Contact Modal State
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [activeContactProduct, setActiveContactProduct] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const fetchPurchases = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/products/user/purchases`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error("Failed to fetch purchases", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const openRatingModal = (product, value) => {
    setSelectedProduct(product);
    setRatingValue(value);
    setRatingComment("");
    setIsModalOpen(true);
  };

  const submitRating = async () => {
    if (!selectedProduct) return;
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/api/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          product_id: selectedProduct.product_id,
          rated_user_id: selectedProduct.seller_id,
          rating_value: ratingValue,
          comment: ratingComment
        })
      });

      if (res.ok) {
        addToast("Rating submitted successfully!", "success");
        setIsModalOpen(false);
        fetchPurchases(); // Refresh to hide buttons
      } else {
        const err = await res.json();
        addToast(`Failed to submit rating: ${err.message}`, "error");
      }
    } catch (e) {
      console.error(e);
      addToast("Error submitting rating.", "error");
    }
  };

  // Implement openContactModal
  const openContactModal = async (product) => {
    const token = localStorage.getItem('token'); // Ensure token is available
    if (!token) return;

    setActiveContactProduct(product);
    setIsContactModalOpen(true);
    setMessages([]); // Reset
    // Fetch Messages
    try {
      const res = await fetch(`${API_URL}/api/messages/${product.product_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) { console.error(err); }
  };

  const closeContactModal = () => {
    setIsContactModalOpen(false);
    setActiveContactProduct(null);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setIsSending(true);
    const token = localStorage.getItem('token'); // Ensure token is available
    if (!token) {
      setIsSending(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/messages/${activeContactProduct.product_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ messageText: newMessage })
      });
      if (res.ok) {
        const msg = await res.json();
        // Append optimistic or real
        // The API returns the new message object
        // We need to shape it like the list: { ...msg, sender: { full_name: 'Me' } }
        // Wait, API returns raw prisma object?
        // I should check `messageRoutes`. It returns `newMessage`.
        // I should fetch again or manually append.
        // Manual append:
        setMessages([...messages, { ...msg, sender: { full_name: 'You' } }]);
        setNewMessage("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const displayedProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const handlePageChange = (page) => setCurrentPage(page);

  return (
    <section id="my-purchases" className="container mx-auto px-4 md:px-10 lg:px-32 xl:px-40 py-16 font-poppins text-[#1f1f1f]">
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
        <Sidebar />
        <div className="flex-grow w-full">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <h2 className="text-xl font-medium text-black">My Purchases ({products.length})</h2>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-500">Loading...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-500">You haven't purchased any items yet.</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {displayedProducts.map((product) => {
                  const imageUrl = product.main_image_url || product.images?.[0]?.image_url || "https://via.placeholder.com/200";
                  const isPaid = product.paymentStatus === 'Paid';

                  // Status Color Logic
                  let statusBg = 'bg-[#AE9B84]'; // Default/Unpaid
                  if (product.paymentStatus === 'Paid') statusBg = 'bg-[#6F5B47]'; // Darker for Paid
                  if (product.paymentStatus === 'Cancelled') statusBg = 'bg-[#D6C8B7] text-gray-700'; // Lighter for Cancelled
                  // if (product.paymentStatus === 'Unpaid') statusBg = 'bg-[#AE9B84]'; // Redundant but explicit


                  return (
                    <div key={product.product_id} className="group flex flex-col gap-3 relative">
                      {/* Image Container */}
                      <div className="relative bg-[#F5F5F5] rounded h-[250px] flex items-center justify-center overflow-hidden border border-gray-100">
                        {/* Status Badge */}
                        <div className={`absolute top-2 left-2 px-3 py-1 text-[10px] uppercase font-bold rounded text-white shadow-sm ${statusBg}`}>
                          {product.paymentStatus}
                        </div>

                        <img src={imageUrl} alt={product.name} className="max-h-[160px] max-w-full object-contain drop-shadow-md" />

                        {/* Unified Action Overlay */}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm z-10">
                          {/* Case 1: Paid & Not Rated -> Rate */}
                          {isPaid && !product.hasRated && (
                            <>
                              <button
                                onClick={() => openRatingModal(product, 1)}
                                className="bg-white p-2 rounded-full hover:scale-110 transition shadow-lg text-green-600" title="Like">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a2.25 2.25 0 012.25 2.25c0 1.152-.26 2.247-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.396C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => openRatingModal(product, -1)}
                                className="bg-white p-2 rounded-full hover:scale-110 transition shadow-lg text-red-600" title="Dislike">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.396-.536.78-1.316 1.242-2.149 1.242h-1.053c-.472 0-.745-.556-.5-.96a8.958 8.958 0 001.302-4.665 5.799 5.799 0 00-.654-3.375m-9.585 14.5c-.806 0-1.533.446-2.031 1.08a9.04 9.04 0 00-2.861 2.4c-.723.384-1.35.956-1.653 1.715a4.498 4.498 0 01-.322 1.672V21a2.25 2.25 0 002.25-2.25c0-1.152.26-2.247.723-3.218.266-.558-.107-1.282-.725-1.282H4.496c-1.026 0-1.945-.694-2.054-1.715A11.95 11.95 0 005.091 6.57c.388-.482.987-.729 1.605-.729H8.02c.483 0 .964.078 1.423.23l3.114 1.04a4.501 4.501 0 011.423.23h1.294M7.48 9H5.25m2.23-1.5c-.083-.205-.173-.405-.27-.602-.197-.4.078-.898.523-.898h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.396-.536.78-1.316 1.242-2.149 1.242h1.053c.472 0 .745.556.5.96a8.958 8.958 0 01-1.302 4.665 5.799 5.799 0 01-.654 3.375" />
                                </svg>
                              </button>
                            </>
                          )}

                          {/* Case 2: Unpaid -> Contact & Pay */}
                          {!isPaid && product.paymentStatus !== 'Cancelled' && (
                            <>
                              <button onClick={() => openContactModal(product)} className="bg-white p-2 text-xs font-bold rounded hover:scale-105 transition shadow-sm text-gray-800 flex flex-col items-center gap-1 w-20">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                                </svg>
                                Contact
                              </button>

                              {product.canPay && (
                                <Link to="/billing" state={{ product }} className="bg-[#AE9B84] p-2 text-xs font-bold rounded hover:scale-105 transition shadow-sm text-white flex flex-col items-center gap-1 w-20">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                                  </svg>
                                  Pay Now
                                </Link>
                              )}
                            </>
                          )}

                          <Link
                            to={`/product/${product.product_id}`}
                            className="bg-white p-2 text-xs font-bold rounded hover:scale-105 transition shadow-sm text-gray-800 flex flex-col items-center gap-1 w-20"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            View
                          </Link>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div>
                        <h3 className="font-bold text-base mb-1 truncate" title={product.name}>
                          {product.name}
                        </h3>
                        <div className="text-xs text-gray-400 mb-2">
                          End Date: {new Date(product.end_time).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2 text-sm mb-2 justify-between items-center">
                          <span className="text-[#AE9B84] font-medium">
                            ${Number(product.current_price).toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-400 truncate max-w-[100px]" title={product.seller?.full_name}>
                            Seller: {product.seller?.full_name || '***'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination (Simplified) */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-3 mt-12 text-sm text-gray-600 items-center">
                  {/* ... Pagination Buttons ... */}
                  <button onClick={() => handlePageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>Prev</button>
                  <span>Page {currentPage} of {totalPages}</span>
                  <button onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>Next</button>
                </div>
              )}
            </>
          )}

          {/* RATING MODAL */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl relative">
                <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black">
                  ✕
                </button>
                <h3 className="text-xl font-bold mb-4">Rate Transaction</h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-gray-600">You are rating:</span>
                  <span className={`font-bold ${ratingValue > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {ratingValue > 0 ? "Positive (Like)" : "Negative (Dislike)"}
                  </span>
                </div>

                <textarea
                  className="w-full border rounded p-3 text-sm focus:outline-none focus:border-[#AE9B84] mb-4"
                  rows="4"
                  placeholder="Leave a comment about your experience..."
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                ></textarea>

                <div className="flex justify-end gap-3">
                  <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded border hover:bg-gray-100 text-sm">Cancel</button>
                  <button onClick={submitRating} className="px-4 py-2 rounded bg-[#AE9B84] text-white hover:bg-[#9c8a74] text-sm font-medium shadow-md">Submit Review</button>
                </div>
              </div>
            </div>
          )}

          {/* Contact Seller Modal */}
          {isContactModalOpen && activeContactProduct && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="bg-[#AE9B84] p-4 flex justify-between items-center text-white">
                  <h3 className="font-bold text-lg">Contact Seller</h3>
                  <button onClick={closeContactModal} className="hover:bg-white/20 p-1 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                {/* Info */}
                <div className="p-3 bg-gray-50 border-b flex items-center gap-3">
                  <img src={activeContactProduct.main_image_url} className="w-10 h-10 rounded object-cover" />
                  <div className="text-sm">
                    <div className="font-bold truncate w-48">{activeContactProduct.name}</div>
                    <div className="text-gray-500">Seller: {activeContactProduct.seller?.full_name}</div>
                  </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 min-h-[200px]">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm mt-10">
                      Start a conversation about payment or shipping.
                    </div>
                  ) : (
                    messages.map((msg, idx) => (
                      <div key={idx} className={`p-3 rounded-xl max-w-[85%] text-sm ${msg.sender?.full_name === 'You' ? "bg-[#AE9B84] text-white self-end ml-auto" : "bg-white border self-start"}`}>
                        <div className="font-bold text-[10px] opacity-75 mb-1">{msg.sender?.full_name || 'User'}</div>
                        {msg.message_text}
                      </div>
                    ))
                  )}
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-3 border-t bg-white flex gap-2">
                  <input
                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-[#AE9B84]"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                  />
                  <button disabled={isSending} className="bg-[#AE9B84] text-white p-2 rounded-full hover:bg-[#8F7E6A] disabled:opacity-50">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MyPurchases;

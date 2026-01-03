import { Link } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import Sidebar from "../../components/Sidebar";

const API_URL = import.meta.env.VITE_API_URL;

const MyPurchases = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Rating Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [ratingValue, setRatingValue] = useState(0); // 1 = Like, -1 = Dislike
  const [ratingComment, setRatingComment] = useState("");

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
        alert("Rating submitted successfully!");
        setIsModalOpen(false);
        fetchPurchases(); // Refresh to hide buttons
      } else {
        const err = await res.json();
        alert(`Failed to submit rating: ${err.message}`);
      }
    } catch (e) {
      console.error(e);
      alert("Error submitting rating.");
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
                  let statusBg = 'bg-yellow-500';
                  if (product.paymentStatus === 'Paid') statusBg = 'bg-green-600';
                  if (product.paymentStatus === 'Cancelled') statusBg = 'bg-red-500';
                  if (product.paymentStatus === 'Unpaid') statusBg = 'bg-[#AE9B84]';

                  return (
                    <div key={product.product_id} className="group flex flex-col gap-3 relative">
                      {/* Image Container */}
                      <div className="relative bg-[#F5F5F5] rounded h-[250px] flex items-center justify-center overflow-hidden border border-gray-100">
                        {/* Status Badge */}
                        <div className={`absolute top-2 left-2 px-3 py-1 text-[10px] uppercase font-bold rounded text-white shadow-sm ${statusBg}`}>
                          {product.paymentStatus}
                        </div>

                        <img src={imageUrl} alt={product.name} className="max-h-[160px] max-w-full object-contain drop-shadow-md" />

                        {product.canPay && (
                          <Link to="/billing" state={{ product }} className="absolute bottom-0 w-full bg-black/90 text-white py-2 text-sm font-medium hover:bg-gray-800 transition text-center opacity-0 group-hover:opacity-100 duration-300">
                            Pay Now
                          </Link>
                        )}

                        {/* Rating Overlay Buttons (If Paid & Not Rated) */}
                        {isPaid && !product.hasRated && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
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
                          </div>
                        )}
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

        </div>
      </div>
    </section>
  );
};

export default MyPurchases;

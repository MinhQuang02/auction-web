import { Link } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import Sidebar from "../../components/Sidebar";

const API_URL = import.meta.env.VITE_API_URL;

const MyPurchases = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  // Pagination (Client-side for now as API returns all)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
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

    fetchPurchases();
  }, []);

  // Pagination Logic
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const displayedProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);

  return (
    <section
      id="my-purchases"
      className="container mx-auto px-4 md:px-10 lg:px-32 xl:px-40 py-16 font-poppins text-[#1f1f1f]"
    >
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
        <Sidebar />
        <div className="flex-grow w-full">
          {/* --- Header & Controls --- */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <h2 className="text-xl font-medium text-black">
              My Purchases ({products.length})
            </h2>
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

                  return (
                    <div key={product.product_id} className="group flex flex-col gap-3">
                      {/* Image Container */}
                      <div className="relative bg-[#F5F5F5] rounded h-[250px] flex items-center justify-center overflow-hidden">
                        {/* Badge */}
                        <div className={`absolute top-2 left-2 px-2 py-1 text-[10px] rounded text-white ${isPaid ? 'bg-green-500' : 'bg-yellow-500'}`}>
                          {product.paymentStatus}
                        </div>

                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="max-h-[160px] max-w-full object-contain drop-shadow-lg"
                        />

                        {/* Pay Now Button Overlay - Only if Unpaid */}
                        {product.canPay && (
                          <Link
                            to="/billing"
                            state={{ product }} // Pass product to billing page
                            className="absolute bottom-0 w-full bg-black text-white py-2 text-sm font-medium hover:bg-gray-800 transition text-center opacity-0 group-hover:opacity-100 duration-300"
                          >
                            Pay Now
                          </Link>
                        )}
                      </div>

                      {/* Product Info */}
                      <div>
                        <h3
                          className="font-bold text-base mb-1 truncate"
                          title={product.name}
                        >
                          {product.name}
                        </h3>
                        <div className="flex gap-2 text-sm mb-2 justify-between">
                          <span className="text-[#AE9B84] font-medium">
                            ${Number(product.current_price).toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-400">
                            Seller: {product.seller?.full_name || '***'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* --- Pagination --- */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-3 mt-12 text-sm text-gray-600 items-center">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 hover:text-black transition disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-8 h-8 rounded flex items-center justify-center ${currentPage === page ? 'bg-[#AE9B84] text-white' : 'hover:bg-gray-200'}`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 hover:text-black transition disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default MyPurchases;

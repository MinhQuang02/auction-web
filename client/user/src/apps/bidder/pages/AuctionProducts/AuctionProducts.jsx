import { Link } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import Sidebar from "../../components/Sidebar";

const API_URL = import.meta.env.VITE_API_URL;

const AuctionProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchDeep = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/api/products/user/active-bids`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error("Failed to fetch active bids", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeep();
  }, []);

  // Pagination Logic
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const displayedProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => setCurrentPage(page);

  return (
    <section
      id="auction-products"
      className="container mx-auto px-4 md:px-10 lg:px-32 xl:px-40 py-16 font-poppins text-[#1f1f1f]"
    >
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
        <Sidebar />
        <div className="flex-grow w-full">
          {/* --- Header & Controls --- */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <h2 className="text-xl font-medium text-black">
              My Active Bids ({products.length})
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-20 text-gray-500">Loading...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-gray-500">You are not bidding on any items currently.</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {displayedProducts.map((product) => {
                  const imageUrl = product.main_image_url || product.images?.[0]?.image_url || "https://via.placeholder.com/200";
                  const endDate = new Date(product.end_time).toLocaleDateString();

                  return (
                    <div key={product.product_id} className="group flex flex-col gap-3">
                      {/* Image Container */}
                      <div className="relative bg-[#F5F5F5] rounded h-[250px] flex items-center justify-center overflow-hidden">
                        {/* Badge: Winning or Outbid */}
                        <div className={`absolute top-2 left-2 px-2 py-1 text-[10px] rounded shadow-sm font-bold uppercase ${product.is_winning ? 'bg-[#AE9B84] text-white' : 'bg-[#D6C8B7] text-gray-700'}`}>
                          {product.is_winning ? 'Leading' : 'Not Leading'}
                        </div>

                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="max-h-[160px] max-w-full object-contain drop-shadow-lg"
                        />

                        {/* Link Button Overlay */}
                        <Link
                          to={`/product/${product.product_id}`}
                          className="absolute bottom-0 w-full bg-black text-white py-2 text-sm font-medium hover:bg-gray-800 transition text-center opacity-0 group-hover:opacity-100 duration-300"
                        >
                          View Details
                        </Link>
                      </div>

                      {/* Product Info */}
                      <div>
                        <h3
                          className="font-bold text-base mb-1 truncate"
                          title={product.name}
                        >
                          {product.name}
                        </h3>
                        <div className="flex flex-col gap-1 text-sm mb-2">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Current Price:</span>
                            <span className="text-[#AE9B84] font-medium">${Number(product.current_price).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">My Max Bid:</span>
                            <span className="font-medium">${Number(product.my_bid).toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="bg-gray-100 rounded-full px-3 py-1 text-[10px] text-gray-500 inline-block">
                          Ends: {endDate}
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

export default AuctionProducts;

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import ProductGrid from "./ProductGrid";

function CategoryPage() {
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // ... (previous states)
  const [watchlistIds, setWatchlistIds] = useState(new Set());
  const token = localStorage.getItem('token');

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Fetch Watchlist
  useEffect(() => {
    if (!token) return;
    const fetchWatchlist = async () => {
      try {
        const res = await fetch(`${API_URL}/api/watchlist`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const ids = new Set(data.map(item => item.product_id));
          setWatchlistIds(ids);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchWatchlist();
  }, [token]);

  useEffect(() => {
    // Reset page when category changes
    setCurrentPage(1);
  }, [id]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Note: New backend logic returns { products, total, page, totalPages }
        const res = await fetch(`${API_URL}/api/products?category_id=${id}&page=${currentPage}&limit=12`);
        if (res.ok) {
          const data = await res.json();
          // Handle both array (legacy fallback) and new object format
          if (Array.isArray(data)) {
            setProducts(data);
          } else {
            setProducts(data.products || []);
            setTotalPages(data.totalPages || 1);
          }
        }
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProducts();
  }, [id, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo(0, 0);
    }
  };

  // Calculate Page Numbers with Ellipses
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  const handleHide = async (productId) => {
    // Find current product category (we are in category page so we know it, or find in list)
    const currentProduct = products.find(p => p.product_id === productId);
    const categoryId = currentProduct ? currentProduct.category_id : id; // Use current or fallback to page id

    try {
      // Exclude current visible products
      const currentIds = products.map(p => p.product_id);
      const url = `${API_URL}/api/products/replacement?excludeIds=${currentIds.join(',')}${categoryId ? `&categoryId=${categoryId}` : ''}`;

      const res = await fetch(url);

      if (res.ok) {
        const newProduct = await res.json();
        setProducts(prev => prev.map(p => p.product_id === productId ? newProduct : p));
      } else {
        setProducts(prev => prev.filter(p => p.product_id !== productId));
      }
    } catch (err) {
      console.error("Replacement failed", err);
      setProducts(prev => prev.filter(p => p.product_id !== productId));
    }
  };

  const handleToggleWatchlist = async (product) => {
    if (!token) {
      alert("Please login to use watchlist");
      return;
    }
    const productId = product.product_id;
    const isWatchlisted = watchlistIds.has(productId);

    setWatchlistIds(prev => {
      const next = new Set(prev);
      if (isWatchlisted) next.delete(productId);
      else next.add(productId);
      return next;
    });

    try {
      if (isWatchlisted) {
        await fetch(`${API_URL}/api/watchlist/${productId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      } else {
        await fetch(`${API_URL}/api/watchlist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ product_id: productId })
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <section
        id="hero"
        className="container mx-auto px-5 lg:px-12 py-10 flex flex-col lg:flex-row gap-10"
      >
        <Sidebar />

        <div className="flex-1 flex flex-col">
          {loading ? (
            <div className="text-center py-20 text-gray-400">Loading...</div>
          ) : (
            <>
              <ProductGrid
                products={products}
                watchlistIds={watchlistIds}
                onToggleWatchlist={handleToggleWatchlist}
                onHide={handleHide}
              />

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-10 gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                  >
                    Prev
                  </button>

                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => typeof page === 'number' && handlePageChange(page)}
                      disabled={typeof page !== 'number'}
                      className={`w-10 h-10 rounded border flex items-center justify-center transition-colors ${page === currentPage
                        ? "bg-[#AE9B84] text-white border-[#AE9B84]"
                        : typeof page === 'number'
                          ? "bg-white text-gray-700 hover:bg-gray-50 cursor-pointer"
                          : "bg-transparent border-none text-gray-500 cursor-default"
                        }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
      <div>
        <br />
        <br />
      </div>
    </>
  );
}

export default CategoryPage;

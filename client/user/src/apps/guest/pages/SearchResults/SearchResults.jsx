import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import ProductGrid from "../CategoryPage/ProductGrid";

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const keyword = searchParams.get('keyword') || '';
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [watchlistIds, setWatchlistIds] = useState(new Set());
    const [sortBy, setSortBy] = useState("time_desc");
    const [config, setConfig] = useState({ time_limited: 60 });

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 12;

    const token = localStorage.getItem('token');
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

    // Fetch Config
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch(`${API_URL}/api/config`);
                if (res.ok) {
                    const data = await res.json();
                    setConfig(data);
                }
            } catch (e) {
                console.error("Config load error", e);
            }
        };
        fetchConfig();
    }, []);

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

    // Reset page when keyword changes
    useEffect(() => {
        setCurrentPage(1);
    }, [keyword]);

    // Fetch Products
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // Fetch using pagination params and sorting
                const res = await fetch(`${API_URL}/api/products?keyword=${encodeURIComponent(keyword)}&page=${currentPage}&limit=${itemsPerPage}&sort_by=${sortBy}`);
                if (res.ok) {
                    const data = await res.json();

                    let fetchedProducts = [];
                    // Handle both array (legacy) and new object format { products, total, totalPages }
                    if (Array.isArray(data)) {
                        fetchedProducts = data;
                        setTotalPages(1);
                    } else {
                        fetchedProducts = data.products || [];
                        setTotalPages(data.totalPages || 1);
                    }

                    // Apply New Arrival Logic
                    const now = new Date();
                    const limitMinutes = parseInt(config.time_limited) || 60; // Using config for "New" threshold

                    fetchedProducts = fetchedProducts.map(p => {
                        const createdTime = new Date(p.created_at);
                        const diffMs = now - createdTime;
                        const diffMins = Math.floor(diffMs / 60000);
                        return {
                            ...p,
                            // Highlight if created within N minutes
                            is_highlighted: diffMins >= 0 && diffMins <= limitMinutes
                        };
                    });

                    setProducts(fetchedProducts);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        if (keyword) fetchProducts();
        else {
            setProducts([]);
            setLoading(false);
        }
    }, [keyword, config, currentPage, sortBy]); // Added sortBy dependency

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

    // Pagination Handlers
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo(0, 0);
        }
    };

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

    return (
        <section className="container mx-auto px-5 lg:px-12 py-10 flex flex-col lg:flex-row gap-10 min-h-[60vh]">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Search Results for "{keyword}"</h2>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm text-[#1f1f1f] bg-white focus:outline-none focus:border-[#AE9B84] transition shadow-sm"
                    >
                        <option value="time_desc">End Time: Descending</option>
                        <option value="price_asc">Price: Low to High</option>
                    </select>
                </div>
                {loading ? (
                    <div className="text-center py-20 text-gray-400">Loading...</div>
                ) : (
                    <>
                        <ProductGrid
                            products={products}
                            watchlistIds={watchlistIds}
                            onToggleWatchlist={handleToggleWatchlist}
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
    );
};

export default SearchResults;

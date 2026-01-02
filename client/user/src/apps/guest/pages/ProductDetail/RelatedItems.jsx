import React, { useState, useEffect } from "react";
import ProductCard from "../../../../shared/components/ProductCard";
import arrowLeft from "@assets/images/_arrowLeft.svg";
import arrowRight from "@assets/images/_arrowRight.svg";

const API_URL = import.meta.env.VITE_API_URL;

const RelatedItems = ({ products: initialProducts = [] }) => {
  const [products, setProducts] = useState([]);
  const [watchlistIds, setWatchlistIds] = useState(new Set());
  const token = localStorage.getItem('token');

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

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

  const handleHide = async (productId) => {
    // Find current product category
    const currentProduct = products.find(p => p.product_id === productId);
    const categoryId = currentProduct ? currentProduct.category_id : null;

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
    const id = product.product_id;
    const isWatchlisted = watchlistIds.has(id);

    setWatchlistIds(prev => {
      const next = new Set(prev);
      if (isWatchlisted) next.delete(id);
      else next.add(id);
      return next;
    });

    try {
      if (isWatchlisted) {
        await fetch(`${API_URL}/api/watchlist/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      } else {
        await fetch(`${API_URL}/api/watchlist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ product_id: id })
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (products.length === 0) return null;

  return (
    <section
      id="related-items"
      className="container mx-auto px-5 lg:px-12 py-10"
    >
      {/* Header Section */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-5 h-10 bg-[#DB4444] rounded"></div>
            <span className="text-[#DB4444] font-semibold">Our Products</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-wide">
            Related Items
          </h2>
        </div>
      </div>

      {/* Scrollable Product List */}
      <div className="flex gap-8 overflow-x-auto pb-6 scrollbar-hide snap-x">
        {products.map((product) => (
          <ProductCard
            key={product.product_id}
            product={product}
            isWatchlisted={watchlistIds.has(product.product_id)}
            onToggleWatchlist={handleToggleWatchlist}
            onHide={handleHide}
          />
        ))}
      </div>
    </section>
  );
};

export default RelatedItems;

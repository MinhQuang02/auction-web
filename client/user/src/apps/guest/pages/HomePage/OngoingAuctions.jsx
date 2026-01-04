import React, { useState, useEffect, useRef } from "react";
import ProductCard from "../../../../shared/components/ProductCard";

import arrowLeft from "@assets/images/_arrowLeft.svg";
import arrowRight from "@assets/images/_arrowRight.svg";
import { useToast } from "../../../../components/ui/Toast";

const API_URL = import.meta.env.VITE_API_URL;

const OngoingAuctions = () => {
  const [products, setProducts] = useState([]);
  const { addToast } = useToast();
  const [watchlistIds, setWatchlistIds] = useState(new Set());
  const scrollRef = useRef(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchOngoing = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products/ongoing`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        }
      } catch (err) {
        console.error("Failed to fetch ongoing products", err);
      }
    };
    fetchOngoing();
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

  // Replacement Logic
  const handleHide = async (productId) => {
    // 1. Remove immediately (Enhancement: loading state?)
    // We keep the slot but show loading or just replace

    try {
      // Exclude current visible products to avoid duplicates
      const currentIds = products.map(p => p.product_id);
      const res = await fetch(`${API_URL}/api/products/replacement?excludeIds=${currentIds.join(',')}`);

      if (res.ok) {
        const newProduct = await res.json();
        setProducts(prev => prev.map(p => p.product_id === productId ? newProduct : p));
      } else {
        // If no replacement, just remove
        setProducts(prev => prev.filter(p => p.product_id !== productId));
      }
    } catch (err) {
      console.error("Failed to fetch replacement", err);
      // Fallback remove
      setProducts(prev => prev.filter(p => p.product_id !== productId));
    }
  };

  // Watchlist Logic
  const handleToggleWatchlist = async (product) => {
    if (!token) {
      addToast("Please login to use watchlist", "info");
      return;
    }
    const id = product.product_id;
    const isWatchlisted = watchlistIds.has(id);

    // Optimistic Update
    setWatchlistIds(prev => {
      const next = new Set(prev);
      if (isWatchlisted) next.delete(id);
      else next.add(id);
      return next;
    });

    try {
      if (isWatchlisted) {
        // Remove
        await fetch(`${API_URL}/api/watchlist/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        // Add
        await fetch(`${API_URL}/api/watchlist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ product_id: id })
        });
      }
    } catch (err) {
      console.error("Watchlist action failed", err);
      // Revert on error
      setWatchlistIds(prev => {
        const next = new Set(prev);
        if (isWatchlisted) next.add(id);
        else next.delete(id);
        return next;
      });
    }
  };


  // Auto-scroll logic (Slower)
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        // If reached end, scroll back to start, else scroll one item width (approx 300px)
        if (scrollLeft + clientWidth >= scrollWidth - 10) { // Tolerance
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
      }
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [products]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (products.length === 0) return null;

  return (
    <section
      id="ongoing-auctions"
      className="container mx-auto px-5 lg:px-12 py-10"
    >
      {/* Header Section */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-5 h-10 bg-[#AE9B84] rounded"></div>
            <span className="text-[#AE9B84] font-semibold">Today’s</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-wide">
            Ongoing Auctions
          </h2>
        </div>

        {/* Navigation Arrows */}
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="bg-gray-100 p-3 rounded-full cursor-pointer hover:bg-[#AE9B84] hover:text-white transition group"
          >
            <img src={arrowLeft} alt="Prev" className="w-6 h-6 group-hover:invert group-hover:brightness-0 transition" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="bg-gray-100 p-3 rounded-full cursor-pointer hover:bg-[#AE9B84] hover:text-white transition group"
          >
            <img src={arrowRight} alt="Next" className="w-6 h-6 group-hover:invert group-hover:brightness-0 transition" />
          </button>
        </div>
      </div>

      {/* Scrollable List */}
      <div
        ref={scrollRef}
        className="flex gap-8 overflow-x-auto pb-6 scrollbar-hide snap-x scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
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

export default OngoingAuctions;

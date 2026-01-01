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
  
  // State for Real Data
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // 1. Fetch Real Products on Load
  useEffect(() => {
    const fetchMyProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/products/seller/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Failed to fetch your products");

        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
        setError("Could not load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyProducts();
  }, []);

  // Pagination Logic
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const currentProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-10">
      <Panel className="p-6">
        <VBox className="flex-1 justify-center gap-10">
          {/* Header */}
          <HBox className="h-14">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold">Seller Products</h2>
              <span className="ml-4 text-sm text-gray-500">
                ({products.length} Items)
              </span>
            </div>

            <div className="flex-1" />
            <HBox>
              {/* Add Button */}
              <button 
                onClick={() => navigate("/seller/products/new")}
                className="bg-primary/60 text-black font-semibold px-4 py-2 rounded-xl hover:bg-primary/80 active:bg-primary flex items-center gap-2"
              >
                New Product
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            </HBox>
          </HBox>

          {/* Error / Loading State */}
          {loading && <div className="text-center py-10">Loading your products...</div>}
          {error && <div className="text-center text-red-500 py-10">{error}</div>}
          
          {/* Empty State */}
          {!loading && !error && products.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              You haven't posted any auctions yet.
            </div>
          )}

          {/* Grid - Map REAL Data */}
          <div className="grid grid-cols-4 gap-4">
            {currentProducts.map((p) => (
              <ProductCard
                key={p.product_id}
                product={{
                    id: p.product_id,
                    name: p.name,
                    price: `$${p.current_price || p.start_price}`,
                    image: p.main_image_url || p.images?.[0]?.image_url || "https://placehold.co/600x400",
                    status: p.status,
                    seller: "You"
                }}
                mode="owner" // Enable Edit buttons
              />
            ))}
          </div>

          {/* Pagination */}
          {products.length > 0 && (
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPrev={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                onNext={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                onSelect={(p) => setCurrentPage(() => p)}
            />
          )}
        </VBox>
      </Panel>
    </div>
  );
};

export default MyProducts;
import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Product from "./Product";
import AuctionHistory from "./AuctionHistory";
import AskSeller from "./AskSeller";
import RelatedItems from "./RelatedItems";
import { useAuth } from "@context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

function ProductDetail() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth(); 
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProductData = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`);
      if (!res.ok) throw new Error("Product not found");

      const data = await res.json();
      setProduct(data.product);
      setRelatedProducts(data.related_products || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setLoading(true); 
    fetchProductData();
  }, [fetchProductData]);

  if (loading) return <div className="p-20 text-center">Loading...</div>;
  if (error) return <div className="p-20 text-center text-red-500">{error}</div>;
  if (!product) return null;

  const isOwner = isAuthenticated && user?.id === product.seller_id;

  return (
    <div>
      <section id="hero" className="container mx-auto px-5 lg:px-12 py-10 flex flex-col lg:flex-row gap-10">
        <Sidebar />

        <Product 
            product={product} 
            isOwner={isOwner}
            onBidSuccess={fetchProductData} 
        /> 
      </section>

      <AuctionHistory 
          bids={product.bids} 
          productId={product.product_id}
          isOwner={isOwner}
          onBanSuccess={fetchProductData}
      />

      <AskSeller 
          productId={product.product_id} 
          sellerName={product.seller?.full_name}
          sellerId={product.seller_id}
          isOwner={isOwner}
      />
      
      <RelatedItems products={relatedProducts} />
    </div>
  );
}

export default ProductDetail;
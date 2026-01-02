import React, { useState, useEffect } from "react";
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
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/api/products/${id}`);
        if (!res.ok) throw new Error("Product not found");

        const data = await res.json();

        setProduct(data.product);
        setRelatedProducts(data.related_products || []);
        setQuestions(data.questions || []);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProductData();
  }, [id]);

  if (loading) return <div className="p-20 text-center text-2xl font-bold text-blue-600">Loading Product ID: {id}...</div>;
  if (error) return <div className="p-20 text-center text-red-600 font-bold">Error: {error}</div>;
  if (!product) return <div className="p-20 text-center text-gray-500">Product Not Found.</div>;

  return (
    // DEBUG STYLE: Red Border to prove this file is running
    <div>
      <section
        id="hero"
        className="container mx-auto px-5 lg:px-12 py-10 flex flex-col lg:flex-row gap-10"
      >
        <Sidebar />
        <Product product={product} />
      </section>

      <AuctionHistory bids={product.bids || []} />

      <AskSeller
        productId={product.product_id}
        sellerName={product.seller?.full_name}
        questions={questions}
      />

      <RelatedItems products={relatedProducts} />
    </div>
  );
}

export default ProductDetail;
import React, { useState } from "react";
import Panel from "@shared/components/Panel";
import VBox from "@shared/components/VBox";
import HBox from "@shared/components/HBox";
import ProductCard from "./ProductCard";
import Pagination from "./Pagination";

const products = Array.from({ length: 160 }).map((_, i) => ({
  id: i,
  name: `Product ${i + 1}`,
  seller: `Seller ${i + 1}`,
  status: i % 2 === 0 ? "Bidding" : "Ended",
  price: `$${(i + 1) * 10}`,
  image: "https://placehold.co/600x400",
}));

const MyProducts = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
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
            </div>

            <div className="flex-1" />
            <HBox>
              <div className="w-[20rem] relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6 absolute left-3 top-1/2 -translate-y-1/2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>

                <input
                  type="text"
                  className="pl-10 py-2 border rounded-xl w-full h-full font-semibold"
                  placeholder="Search..."
                />
              </div>

              <button className="bg-primary/60 text-black font-semibold px-4 py-1 rounded-xl hover:bg-primary/80 active:bg-primary flex items-center gap-2">
                New Product
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </button>
            </HBox>
          </HBox>

          {/* Grid */}
          <div className="grid grid-cols-4 gap-4">
            {currentProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                mode={product.id % 2 === 0 ? "owner" : "viewer"}
              />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPrev={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            onNext={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            onSelect={(p) => setCurrentPage(() => p)}
          />
        </VBox>
      </Panel>
    </div>
  );
};

export default MyProducts;

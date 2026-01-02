import ProductCard from "../../../../shared/components/ProductCard";

const ProductGrid = ({ products = [], onToggleWatchlist, onHide, watchlistIds = new Set() }) => {
  return (
    <div className="flex-grow bg-transparent p-0 flex flex-col font-sans text-[#1f1f1f] relative h-full">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        {/* Breadcrumb / Count */}
        <div className="text-sm">
          <span className="text-gray-400">Total Products:</span>{" "}
          <span className="font-medium text-black ml-1">{products.length}</span>
        </div>

        {/* Sorting & Layout Placeholders (Visual Only) */}
        <div className="flex items-center gap-3">
          {/* Sorting UI kept as placeholder */}
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No products found in this category.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6">
          {products.map((product) => (
            <ProductCard
              key={product.product_id}
              product={product}
              isWatchlisted={watchlistIds.has(product.product_id)}
              onToggleWatchlist={onToggleWatchlist}
              onHide={onHide}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGrid;

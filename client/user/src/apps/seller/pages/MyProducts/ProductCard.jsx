import Panel from "@shared/components/Panel";
import VBox from "@shared/components/VBox";
import HBox from "@shared/components/HBox";
import { Pencil, Trash2, ArrowRight, ThumbsUp, ThumbsDown } from "lucide-react";

const IconButton = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="p-2 rounded-full hover:bg-gray-100 transition text-gray-700"
  >
    {children}
  </button>
);

const ProductCard = ({ product, mode = "viewer" }) => (
  <Panel>
    <VBox>
      {/* Image container */}
      <div className="relative group overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-64 object-cover"
        />

        {/* Darken overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition" />

        {/* Buttons */}
        <div
          className="absolute inset-0 flex items-center justify-center
             opacity-0 group-hover:opacity-100
             pointer-events-none group-hover:pointer-events-auto
             transition"
        >
          <div className="flex items-center gap-2 bg-white rounded-full px-3 py-2 shadow-lg">
            {mode === "owner" ? (
              <>
                <IconButton>
                  <Pencil size={18} />
                </IconButton>
                <IconButton>
                  <Trash2 size={18} />
                </IconButton>
                <IconButton>
                  <ArrowRight size={18} />
                </IconButton>
              </>
            ) : (
              <>
                <IconButton>
                  <ThumbsUp size={18} />
                </IconButton>
                <IconButton>
                  <ThumbsDown size={18} />
                </IconButton>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="flex justify-between p-4 items-center">
        <HBox className="flex-1">
          <VBox className="flex-1">
            <span className="font-semibold">{product.name}</span>
            <span className="text-sm font-semibold text-gray-500">
              {product.status}
            </span>
          </VBox>

          <div className="flex-1" />

          <VBox className="flex-1 items-end">
            <div className="px-2 rounded font-semibold bg-primary/30">
              {product.price}
            </div>
            <div className="text-sm text-gray-500 font-semibold">
              {product.seller}
            </div>
          </VBox>
        </HBox>
      </div>
    </VBox>
  </Panel>
);

export default ProductCard;

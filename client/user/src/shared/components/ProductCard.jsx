import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@context/AuthContext";
import wishIcon from "@assets/images/_wishIcon.svg"; 
import viewIcon from "@assets/images/_viewIcon.svg";

const ProductCard = ({ product, isWatchlisted, onToggleWatchlist, onHide, className = "", isHighlighted = false }) => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleWishlistClick = (e) => {
        e.stopPropagation(); 
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        if (onToggleWatchlist) onToggleWatchlist(product);
    };

    const handleHideClick = (e) => {
        e.stopPropagation();
        if (onHide) onHide(product.product_id);
    };

    const formatPrice = (price) => {
        return price ? `$${parseFloat(price).toLocaleString()}` : "$0.00";
    };

    const imageUrl = product.main_image_url || product.images?.[0]?.image_url || "https://placehold.co/400x300";
    const buyNowPrice = product.buy_now_price;

    return (
        <div 
            onClick={() => navigate(`/product/${product.product_id}`)}
            className={`
                group bg-white rounded-xl shadow-sm border border-gray-100 
                hover:shadow-lg transition-all duration-300 cursor-pointer 
                flex flex-col h-full overflow-hidden relative
                ${className} 
                ${isHighlighted ? 'ring-2 ring-[#AD9C86] bg-[#AD9C86]/5' : ''}
            `}
        >
            <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {buyNowPrice ? (
                    <div className="absolute top-2 left-2 bg-[#AE9B84] text-white text-xs font-bold px-2 py-1 rounded shadow z-10">
                        Buy Now: ${Number(buyNowPrice).toFixed(0)}
                    </div>
                ) : product.is_new && (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded shadow z-10">
                        NEW
                    </div>
                )}

                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">

                    <button
                        onClick={handleWishlistClick}
                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow transition transform hover:scale-110 ${isWatchlisted ? 'bg-[#AD9C86] text-white' : 'bg-white hover:bg-gray-100 text-gray-600'}`}
                        title={isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" fill={isWatchlisted ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                    </button>

                    {onHide ? (
                        <button
                            onClick={handleHideClick}
                            className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow hover:bg-gray-100 transition transform hover:scale-110"
                            title="Hide / Replace"
                        >
                            <img src={viewIcon} alt="Hide" className="w-4 h-4" /> 
                        </button>
                    ) : null}
                </div>
            </div>

            <div className="p-4 flex flex-col flex-1 gap-2">

                <h3 
                    className="font-bold text-gray-900 leading-tight line-clamp-2 h-[40px]" 
                    title={product.name}
                >
                    {product.name}
                </h3>

                <p className="text-sm text-gray-500 truncate">
                    By {product.current_bidder?.full_name || product.seller?.full_name || "Unknown"}
                </p>

                <div className="mt-auto flex justify-between items-center pt-2 border-t border-gray-50">
                    <div>
                        <p className="text-xs text-gray-400 font-medium">Price</p>
                        <p className="text-lg font-bold text-[#AD9C86]">
                            {formatPrice(product.current_price || product.start_price)}
                        </p>
                    </div>
                    
                    <div className="text-right">
                        <p className="text-xs text-gray-400 font-medium">Bids</p>
                        <p className="text-sm font-semibold text-gray-700">
                            {product.bid_count || 0}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
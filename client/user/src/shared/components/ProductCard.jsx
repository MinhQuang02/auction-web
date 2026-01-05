import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from "@context/AuthContext";

import wishIcon from "@assets/images/_wishIcon.svg";
import viewIcon from "@assets/images/_viewIcon.svg";
import removeIcon from "@assets/images/_removeIcon.svg"; 

const API_URL = import.meta.env.VITE_API_URL;

const ProductCard = ({ product, isWatchlisted, onToggleWatchlist, onHide, className = "", isHighlighted = false }) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Fallbacks
    const imageUrl = product.main_image_url || product.images?.[0]?.image_url || "https://via.placeholder.com/270x250?text=No+Image";
    const buyNowPrice = product.buy_now_price;
    const currentPrice = product.current_price || product.start_price;
    const bidderName = product.current_bidder?.full_name || (product.bids?.[0]?.bidder?.full_name) || "No Bids";

    const handleWishlistClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        if (onToggleWatchlist) {
            onToggleWatchlist(product);
        }
    };

    const handleHideClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onHide) onHide(product.product_id);
    }

    return (
        <div
            className={`flex-none w-[270px] snap-center ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Image Card */}
            <div className={`relative bg-[#F5F5F5] rounded-md shadow-sm h-[250px] flex justify-center items-center overflow-hidden mb-4 group transition-transform duration-300 hover:shadow-lg ${isHighlighted ? 'border-2 border-[#AE9B84] bg-[#AE9B84]/5' : ''}`}>
                <img
                    src={imageUrl}
                    alt={product.name}
                    className="max-h-[180px] object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                />

                {/* Price Tag (Buy Now) */}
                {buyNowPrice && (
                    <div className="absolute top-3 left-3 bg-[#AE9B84] text-white text-xs px-3 py-1 rounded">
                        Buy Now: ${Number(buyNowPrice).toFixed(0)}
                    </div>
                )}

                {/* Action Buttons */}
                <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    {/* Watchlist Heart */}
                    <button
                        onClick={handleWishlistClick}
                        className={`w-[34px] h-[34px] rounded-full flex items-center justify-center shadow transition ${isWatchlisted ? 'bg-[#AE9B84] text-white' : 'bg-white hover:bg-gray-100'}`}
                        title={isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill={isWatchlisted ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`w-5 h-5 ${isWatchlisted ? 'text-white' : 'text-black'}`}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                    </button>

                    {onHide ? (
                        <button
                            onClick={handleHideClick}
                            className="w-[34px] h-[34px] rounded-full bg-white flex items-center justify-center shadow hover:bg-gray-100 transition"
                            title="Hide and Replace"
                        >
                            <img src={viewIcon} alt="Hide" className="w-5 h-5" />
                        </button>
                    ) : (
                        <Link to={`/product/${product.product_id}`} className="w-[34px] h-[34px] rounded-full bg-white flex items-center justify-center shadow hover:bg-gray-100 transition">
                            <img src={viewIcon} alt="View" className="w-5 h-5" />
                        </Link>
                    )}
                </div>

                {/* Bid Now Button Overlay */}
                <Link
                    to={`/product/${product.product_id}`}
                    className={`absolute bottom-0 w-full bg-black text-white text-center py-2 font-medium transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                >
                    Bid Now
                </Link>
            </div>

            {/* Product Info */}
            <h3
                className="font-medium text-base mb-2 truncate"
                title={product.name}
            >
                {product.name} {product.bid_count > 0 ? `(${product.bid_count} bids)` : ''}
            </h3>

            {/* Date Range */}
            <div className="text-xs text-gray-500 mb-2">
                {new Date(product.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {new Date(product.end_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>

            <div className="flex gap-3 items-center mb-2">
                <span className="text-[#AE9B84] font-medium">
                    ${Number(currentPrice).toFixed(2)}
                </span>
                <span className="text-gray-500 opacity-50 font-medium text-sm">
                    by {bidderName}
                </span>
            </div>
        </div>
    );
};

export default ProductCard;

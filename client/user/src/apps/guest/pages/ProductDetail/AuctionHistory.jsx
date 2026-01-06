import React, { useState } from 'react';
import { useToast } from "../../../../components/ui/Toast";
import Modal from "../../../../shared/components/Modal";

const API_URL = import.meta.env.VITE_API_URL;

const AuctionHistory = ({ bids = [], isSeller = false, productId, onRefresh, productStatus }) => {
    const { addToast } = useToast();
    const [processingId, setProcessingId] = useState(null);
    const [selectedReviewUser, setSelectedReviewUser] = useState(null);
    const [userReviews, setUserReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(false);

    const hasData = bids.length > 0;
    const canKick = isSeller && productStatus === 'active';

    const handleKick = async (bidderId) => {
        if (productStatus !== 'active') {
            addToast("Cannot kick bidders from closed auctions.", "error");
            return;
        }

        if (!confirm("Are you sure you want to remove this bidder? This action cancels their bids and bans them from this auction.")) return;

        setProcessingId(bidderId);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/products/${productId}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ bidderId })
            });

            const data = await res.json();
            if (res.ok) {
                addToast("Bidder removed successfully", "success");
                if (onRefresh) onRefresh();
            } else {
                addToast(data.message || "Failed to remove bidder", "error");
            }
        } catch (err) {
            console.error(err);
            addToast("Network error", "error");
        } finally {
            setProcessingId(null);
        }
    };

    const handleViewReviews = async (user) => {
        setSelectedReviewUser(user);
        setLoadingReviews(true);
        setUserReviews([]);
        try {
            const res = await fetch(`${API_URL}/api/ratings/user/${user.user_id}`);
            if (res.ok) {
                const data = await res.json();
                setUserReviews(data);
            } else {
                addToast("Failed to load reviews", "error");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingReviews(false);
        }
    };

    const renderRecommendation = (val) => {
        const isPositive = parseInt(val) === 1;
        const isNegative = parseInt(val) === -1;

        if (isPositive) {
            return (
                <div className="flex items-center gap-1 text-xs font-bold text-[#AE9B84]">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M2.203 12.043l3.355 9.773a1 1 0 00.95.674h12.553a1 1 0 00.95-.68l2.956-9.288a1 1 0 00-.95-1.3l-5.6-.002a2 2 0 01-1.996-2.181l.666-6.6a1 1 0 00-1.63-.787l-7.794 7.794a1 1 0 00-.002.002l-.638 1.93a1 1 0 01-.87.665z"></path></svg>
                    <span>Recommended</span>
                </div>
            )
        }
        if (isNegative) {
            return (
                <div className="flex items-center gap-1 text-xs font-bold text-[#4B4B4B]">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M21.797 11.957l-3.355-9.773a1 1 0 00-.95-.674H4.939a1 1 0 00-.95.68L1.033 11.478a1 1 0 00.95 1.3l5.6 .002a2 2 0 011.996 2.181l-.666 6.6a1 1 0 001.63 .787l7.794-7.794a1 1 0 00.002-.002l.638-1.93a1 1 0 01.87-.665z"></path></svg>
                    <span>Not Recommended</span>
                </div>
            )
        }
        return <span className="text-gray-400 text-xs">No Status</span>;
    };

    // Grid cols logic
    let gridCols = "grid-cols-3"; // Default for Buyer
    if (isSeller) {
        gridCols = canKick
            ? "grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_80px]"
            : "grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr]";
    }

    return (
        <section id="auction-history" className="container mx-auto px-5 lg:px-12 py-16 font-sans text-[#1f1f1f]">

            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 tracking-wide">Auction History</h2>

            <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">

                {/* Table Header */}
                <div className={`grid ${gridCols} bg-[#E0E0E0] py-4 px-6 font-bold text-base md:text-lg text-black gap-2`}>
                    <div>Time</div>
                    <div>Bidder</div>
                    {isSeller && <div>Rating</div>}
                    {isSeller && <div>Reviews</div>}
                    <div>Price</div>
                    {canKick && <div className="text-center">Action</div>}
                </div>

                {/* Table Body */}
                <div className={`flex flex-col text-sm md:text-base text-gray-600 ${bids.length > 5 ? 'h-[320px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300' : ''}`}>
                    {!hasData ? (
                        <div className="p-6 text-center text-gray-500">No bids yet. Be the first!</div>
                    ) : (
                        bids.map((bid, index) => {
                            const rowBgClass = index % 2 === 0 ? 'bg-[#F5F5F5]' : 'bg-white';
                            const timeStr = new Date(bid.bid_time).toLocaleString();
                            const bidderName = bid.bidder?.full_name || "Unknown";
                            const priceStr = `$${Number(bid.max_bid_amount).toLocaleString()}`;
                            const isProcessed = processingId === bid.bidder_id;

                            // Rating Info (Binary Avg)
                            // avg_rating is between -1 and 1.
                            const avgVal = bid.bidder?.avg_rating ? parseFloat(bid.bidder.avg_rating) : 0;
                            const totalRatings = bid.bidder?.total_ratings || 0;

                            // Determine Color for Table Display
                            let ratingColor = "text-[#AE9B84]";

                            // Format: +0.5, -1.0, 0.0
                            const formattedRating = (avgVal > 0 ? "+" : "") + avgVal.toFixed(1);

                            return (
                                <div
                                    key={bid.bid_id || index}
                                    className={`grid ${gridCols} py-4 px-6 border-b border-gray-100 hover:bg-gray-200 transition ${rowBgClass} items-center group relative gap-2`}
                                >
                                    <div>{timeStr}</div>
                                    <div className="truncate" title={bidderName}>{bidderName}</div>

                                    {isSeller && (
                                        <>
                                            {/* Rating Score */}
                                            <div className={`flex items-center gap-1 font-bold ${ratingColor}`}>
                                                <span>{formattedRating}</span>
                                            </div>

                                            {/* Reviews Count */}
                                            <div>
                                                {totalRatings > 0 ? (
                                                    <button
                                                        onClick={() => handleViewReviews({ ...bid.bidder, user_id: bid.bidder_id })}
                                                        className="underline text-blue-600 hover:text-blue-800"
                                                    >
                                                        {totalRatings} reviews
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400">0 reviews</span>
                                                )}
                                            </div>
                                        </>
                                    )}

                                    <div className="font-semibold text-[#AE9B84]">
                                        {priceStr}
                                        {bid.status === 'auto' && <span className="ml-2 text-xs bg-[#AE9B84] text-white px-1.5 py-0.5 rounded">Auto</span>}
                                        {bid.status === 'outbid' && <span className="ml-2 text-xs bg-gray-300 text-gray-600 px-1.5 py-0.5 rounded">Outbid</span>}
                                    </div>

                                    {canKick && (
                                        <div className="flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <button
                                                onClick={() => handleKick(bid.bidder_id)}
                                                disabled={isProcessed}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition"
                                                title="Kick Bidder"
                                            >
                                                {isProcessed ? (
                                                    <span className="animate-spin text-lg">↻</span>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* User Reviews Modal - Styled like ProductReview/SellerReview */}
            <Modal isOpen={!!selectedReviewUser} onClose={() => setSelectedReviewUser(null)}>
                <div className="w-full">
                    {/* Modal Header */}
                    <div className="bg-[#F5F5F5] p-6 border-b border-gray-200">
                        <h3 className="text-xl font-medium text-black mb-1">Reviews for {selectedReviewUser?.full_name}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                            <span className={`font-bold ${parseFloat(selectedReviewUser?.avg_rating || 0) >= 0 ? 'text-[#AE9B84]' : 'text-[#4B4B4B]'}`}>
                                {selectedReviewUser?.avg_rating > 0 ? "+" : ""}{parseFloat(selectedReviewUser?.avg_rating || 0).toFixed(2)} Rating
                            </span>
                            <span>•</span>
                            <span className="text-gray-500">{selectedReviewUser?.total_ratings || 0} Reviews</span>
                        </div>
                    </div>

                    {/* Modal Body / Review List */}
                    <div className="bg-[#EAEAEA] p-6 max-h-[60vh] overflow-y-auto">
                        {loadingReviews ? (
                            <div className="text-center py-8 text-gray-500">Loading reviews...</div>
                        ) : userReviews.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">No reviews found.</div>
                        ) : (
                            <div className="space-y-4">
                                {userReviews.map((review, idx) => (
                                    <div key={idx} className="bg-white p-4 rounded shadow-sm border border-gray-100">

                                        {/* Review Header */}
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex gap-3 items-center">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 text-sm">
                                                    {review.rater?.full_name?.charAt(0) || "U"}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-sm text-[#1f1f1f]">{review.rater?.full_name || "Anonymous"}</div>
                                                    <div className="text-xs text-gray-400 font-mono">
                                                        {new Date(review.created_at || Date.now()).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Tag */}
                                            {renderRecommendation(review.rating_value)}
                                        </div>

                                        {/* Review Content */}
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {review.comment}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </section>
    );
};

export default AuctionHistory;
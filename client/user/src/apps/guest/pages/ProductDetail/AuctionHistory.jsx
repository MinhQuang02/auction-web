import React, { useState } from 'react';
import { useToast } from "../../../../components/ui/Toast";

const API_URL = import.meta.env.VITE_API_URL;

const AuctionHistory = ({ bids = [], isSeller = false, productId, onRefresh, productStatus }) => {
    const { addToast } = useToast();
    const [processingId, setProcessingId] = useState(null);

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

    const gridCols = canKick ? "grid-cols-[1fr_1fr_1fr_100px]" : "grid-cols-3";

    return (
        <section id="auction-history" className="container mx-auto px-5 lg:px-12 py-16 font-sans text-[#1f1f1f]">

            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 tracking-wide">Auction History</h2>

            <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">

                {/* Table Header */}
                <div className={`grid ${gridCols} bg-[#E0E0E0] py-4 px-6 font-bold text-base md:text-lg text-black`}>
                    <div>Time</div>
                    <div>Bidder</div>
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

                            // Format: "27/10/2025 10:43"
                            const timeStr = new Date(bid.bid_time).toLocaleString();
                            // Masked name from backend
                            const bidderName = bid.bidder?.full_name || "Unknown";
                            const priceStr = `$${Number(bid.max_bid_amount).toLocaleString()}`;
                            const isProcessed = processingId === bid.bidder_id;

                            // If user is banned/rejected, style it?
                            // Backend usually filters banned bids or marks them.
                            // If we just kicked them, onRefresh will reload data.

                            return (
                                <div
                                    key={bid.bid_id || index}
                                    className={`grid ${gridCols} py-4 px-6 border-b border-gray-100 hover:bg-gray-200 transition ${rowBgClass} items-center group relative`}
                                >
                                    <div>{timeStr}</div>
                                    <div>{bidderName}</div>
                                    <div className="font-semibold text-[#AE9B84]">{priceStr}</div>

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
        </section>
    );
};

export default AuctionHistory;
const AuctionHistory = ({ bids = [] }) => {
    // Determine which data to use (Fetched or Dummy as fallback if needed, but here we expect fetched)
    const hasData = bids.length > 0;

    return (
        <section id="auction-history" className="container mx-auto px-5 lg:px-12 py-16 font-sans text-[#1f1f1f]">

            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 tracking-wide">Auction History</h2>

            <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">

                {/* Table Header */}
                <div className="grid grid-cols-3 bg-[#E0E0E0] py-4 px-6 font-bold text-base md:text-lg text-black">
                    <div>Time</div>
                    <div>Bidder</div>
                    <div>Price</div>
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

                            return (
                                <div
                                    key={bid.bid_id || index}
                                    className={`grid grid-cols-3 py-4 px-6 border-b border-gray-100 hover:bg-gray-200 transition ${rowBgClass}`}
                                >
                                    <div>{timeStr}</div>
                                    <div>{bidderName}</div>
                                    <div>{priceStr}</div>
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
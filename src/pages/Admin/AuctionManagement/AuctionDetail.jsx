const AuctionDetail = ({ auction }) => {
  if (!auction) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{auction.product_name}</h2>
        <span className="text-gray-500 font-mono">ID: {auction.id}</span>
      </div>

      {/* Basic Info Grid */}
      <div className="grid grid-cols-2 gap-4 text-gray-700">
        <p><strong>Seller ID:</strong> {auction.seller_id}</p>
        <p><strong>Seller Name:</strong> {auction.seller_name}</p>
        <p><strong>Category ID:</strong> {auction.category_id}</p>
        <p><strong>Category Name:</strong> {auction.category_name}</p>
        <p><strong>Start Date:</strong> {auction.start_date}</p>
        <p><strong>End Date:</strong> {auction.end_date}</p>
        <p><strong>Current Highest Bid:</strong> ${auction.current_highest_bid}</p>
        <p><strong>Buy Now Price:</strong> ${auction.buy_now_price}</p>
        <p><strong>Number of Bids:</strong> {auction.number_of_bids}</p>
      </div>

      {/* Description */}
      <div>
        <h3 className="font-semibold text-lg mb-2">Description</h3>
        <p className="text-gray-600">{auction.description}</p>
      </div>

      {/* Images */}
      {auction.images && auction.images.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg mb-2">Images</h3>
          <div className="flex flex-wrap gap-4">
            {auction.images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Auction Image ${index + 1}`}
                className="w-32 h-32 object-cover rounded-md shadow-sm border"
              />
            ))}
          </div>
        </div>
      )}

      {/* Bid History */}
      {auction.bid_history && auction.bid_history.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg mb-2">Bid History</h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-2 font-medium">Bidder</th>
                <th className="p-2 font-medium">Amount</th>
                <th className="p-2 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {auction.bid_history.map((bid, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="p-2">{bid.bidder_name}</td>
                  <td className="p-2">${bid.amount}</td>
                  <td className="p-2">{bid.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AuctionDetail;

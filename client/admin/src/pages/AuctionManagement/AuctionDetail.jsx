const AuctionDetail = ({ auction }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold">{auction.name}</h2>
        <span className="text-gray-500">ID: {auction.product_id}</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <p>
          <b>Seller:</b> {auction.seller?.full_name ?? "-"}
        </p>
        <p>
          <b>Category:</b> {auction.category?.name ?? "-"}
        </p>
        <p>
          <b>Status:</b> {auction.status}
        </p>
        <p>
          <b>Current Price:</b> ${auction.current_price}
        </p>
        <p>
          <b>Buy Now Price:</b> ${auction.buy_now_price}
        </p>
        <p>
          <b>Bid Count:</b> {auction.bid_count}
        </p>
        <p>
          <b>End Time:</b> {new Date(auction.end_time).toLocaleString()}
        </p>
      </div>

      {auction.images?.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Images</h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {auction.images.map((img, i) => (
              <img
                key={i}
                src={img.image_url}
                alt={`${auction.name} ${i + 1}`}
                className="w-full h-40 object-cover rounded border"
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold">Description</h3>
        <p className="text-gray-600">{auction.description}</p>
      </div>

      {auction.bids?.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Bid History</h3>

          <div className="border rounded divide-y text-sm">
            {auction.bids.map((bid, i) => (
              <div key={bid.bid_id} className="flex justify-between px-3 py-2">
                <div>
                  <div className="font-medium">
                    {bid.bidder?.full_name ?? "Unknown bidder"}
                  </div>
                  <div className="text-gray-500">
                    {new Date(bid.bid_time).toLocaleString()}
                  </div>
                </div>

                <div className="font-semibold">
                  ${Number(bid.max_bid_amount).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(!auction.bids || auction.bids.length === 0) && (
        <div className="text-gray-500 italic">No bids yet.</div>
      )}
    </div>
  );
};

export default AuctionDetail;

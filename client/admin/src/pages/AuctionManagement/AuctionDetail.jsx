import { useState } from "react";
import VBox from "@components/VBox";
import HBox from "@components/HBox";

const AuctionDetail = ({ auction, onSave, onRemove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({
    description: auction.description ?? "",
    buy_now_price: auction.buy_now_price,
    end_time: auction.end_time,
  });

  const isFinalized =
    auction.status === "sold" || auction.status === "ended_no_winner";

  const isRemoved = auction.status === "removed";

  const resetDraft = () => {
    setDraft({
      description: auction.description ?? "",
      buy_now_price: auction.buy_now_price,
      end_time: auction.end_time,
    });
  };

  const handleSave = () => {
    if (isFinalized) return;
    onSave?.(draft);
    setIsEditing(false);
  };

  return (
    <VBox className="space-y-10">
      <VBox>
        <h2 className="text-2xl font-bold">{auction.name}</h2>
        <span className="text-sm text-gray-500">ID: {auction.product_id}</span>
      </VBox>

      <VBox className="gap-4">
        <HBox className="justify-between items-center">
          <h3 className="text-lg font-semibold">Auction Information</h3>

          {!isEditing ? (
            <button
              disabled={isFinalized}
              onClick={() => setIsEditing(true)}
              className={`px-3 py-1 border rounded text-sm
                ${isFinalized ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              Edit
            </button>
          ) : (
            <HBox className="gap-2">
              <button
                onClick={() => {
                  resetDraft();
                  setIsEditing(false);
                }}
                className="px-3 py-1 border rounded text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 bg-primary text-white rounded text-sm"
              >
                Save
              </button>
            </HBox>
          )}
        </HBox>

        <div className="grid grid-cols-2 gap-4 text-gray-700">
          <p>
            <strong>Seller:</strong> {auction.seller?.full_name ?? "-"}
          </p>

          <p>
            <strong>Category:</strong> {auction.category?.name ?? "-"}
          </p>

          <p>
            <strong>Status:</strong> {auction.status}
          </p>

          <p>
            <strong>Current Price:</strong> ${auction.current_price}
          </p>

          <p>
            <strong>Buy Now Price:</strong>{" "}
            {!isEditing ? (
              `$${auction.buy_now_price}`
            ) : (
              <input
                type="number"
                className="border px-2 py-1 rounded w-full"
                value={draft.buy_now_price}
                onChange={(e) =>
                  setDraft({ ...draft, buy_now_price: e.target.value })
                }
              />
            )}
          </p>

          <p>
            <strong>Bid Count:</strong> {auction.bid_count}
          </p>

          <p>
            <strong>End Time:</strong>{" "}
            {!isEditing ? (
              new Date(auction.end_time).toLocaleString()
            ) : (
              <input
                type="datetime-local"
                className="border px-2 py-1 rounded w-full"
                value={new Date(draft.end_time).toISOString().slice(0, 16)}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    end_time: new Date(e.target.value).toISOString(),
                  })
                }
              />
            )}
          </p>
        </div>
      </VBox>

      {auction.images?.length > 0 && (
        <VBox className="gap-3">
          <h3 className="text-lg font-semibold">Images</h3>
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
        </VBox>
      )}

      <VBox className="gap-2">
        <h3 className="text-lg font-semibold">Description</h3>
        {!isEditing ? (
          <p className="text-gray-600">{auction.description}</p>
        ) : (
          <textarea
            className="border rounded p-2 w-full"
            rows={4}
            value={draft.description}
            onChange={(e) =>
              setDraft({ ...draft, description: e.target.value })
            }
          />
        )}
      </VBox>

      <VBox className="gap-3">
        <h3 className="text-lg font-semibold">Bid History</h3>

        {auction.bids?.length > 0 ? (
          <div className="max-h-64 overflow-y-auto border rounded divide-y text-sm">
            {auction.bids.map((bid) => (
              <HBox
                key={bid.bid_id}
                className="justify-between px-3 py-2 hover:bg-gray-50"
              >
                <VBox>
                  <span className="font-medium">
                    {bid.bidder?.full_name ?? "Unknown bidder"}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {new Date(bid.bid_time).toLocaleString()}
                  </span>
                </VBox>

                <span className="font-semibold">
                  ${Number(bid.max_bid_amount).toLocaleString()}
                </span>
              </HBox>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No bids yet.</p>
        )}
      </VBox>

      <VBox className="gap-4 pt-6 border-t">
        <button
          disabled={isFinalized || isRemoved}
          onClick={() => {
            if (
              confirm(
                "Are you sure you want to remove this auction? This action cannot be undone."
              )
            ) {
              onRemove?.(auction);
            }
          }}
          className={`w-full px-4 py-2 rounded text-white
            ${
              isFinalized || isRemoved
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }
          `}
        >
          Remove Auction
        </button>

        {isFinalized && (
          <p className="text-sm text-gray-500">
            This auction can no longer be removed because it has already ended.
          </p>
        )}

        {isRemoved && (
          <p className="text-sm text-gray-500">
            This auction has already been removed.
          </p>
        )}
      </VBox>
    </VBox>
  );
};

export default AuctionDetail;

import React, { useState } from "react";
import Panel from "@shared/components/Panel";

const API_URL = import.meta.env.VITE_API_URL;

const AuctionHistory = ({ bids, productId, isOwner, onBanSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleReject = async (bidderId) => {
    if (!confirm("Are you sure? This user will be banned from this auction.")) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/products/${productId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bidderId }),
      });

      if (!res.ok) throw new Error("Failed to reject bidder");
      
      alert("Bidder rejected. Calculating new winner...");
      if (onBanSuccess) onBanSuccess();

    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sortedBids = [...(bids || [])].sort((a, b) => b.max_bid_amount - a.max_bid_amount);

  return (
    <section className="container mx-auto px-5 lg:px-12 py-10">
      <Panel className="p-8 rounded-2xl bg-white shadow-sm border border-gray-100">
        <h3 className="text-2xl font-bold mb-6">Bid History</h3>
        
        {sortedBids.length === 0 ? (
            <p className="text-gray-400">No bids yet.</p>
        ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-sm text-gray-500">
                    <th className="py-3">Bidder</th>
                    <th className="py-3">Amount</th>
                    <th className="py-3">Time</th>
                    {isOwner && <th className="py-3 text-right">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {sortedBids.map((bid, idx) => {
                    const isRejected = bid.status === 'rejected';

                    return (
                      <tr key={idx} className={`border-b last:border-0 hover:bg-gray-50 ${isRejected ? 'bg-red-50/50' : ''}`}>
                        
                        {/* Name Column */}
                        <td className="py-3 font-semibold text-gray-700">
                          <span className={isRejected ? "line-through text-gray-400" : ""}>
                             {bid.bidder?.full_name || "****"}
                          </span>
                          
                          {/* Active Winner Badge */}
                          {!isRejected && idx === 0 && (
                              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Highest</span>
                          )}

                          {/* Banned Badge */}
                          {isRejected && (
                              <span className="ml-2 text-xs font-bold text-red-500">(Banned)</span>
                          )}
                        </td>

                        {/* Amount Column */}
                        <td className={`py-3 font-bold ${isRejected ? "line-through text-gray-400" : "text-[#AD9C86]"}`}>
                            ${parseFloat(bid.max_bid_amount).toLocaleString()}
                        </td>

                        {/* Time Column */}
                        <td className="py-3 text-sm text-gray-400">{new Date(bid.bid_time).toLocaleString()}</td>
                        
                        {/* Action Column (Only for Owner) */}
                        {isOwner && (
                          <td className="py-3 text-right">
                              {!isRejected ? (
                                  <button
                                      onClick={() => handleReject(bid.bidder_id || bid.bidder.user_id)}
                                      disabled={loading}
                                      className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded hover:bg-red-100 transition border border-red-200"
                                  >
                                      Reject
                                  </button>
                              ) : (
                                  <span className="text-xs text-gray-400 italic pr-2">Rejected</span>
                              )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
        )}
      </Panel>
    </section>
  );
};

export default AuctionHistory;
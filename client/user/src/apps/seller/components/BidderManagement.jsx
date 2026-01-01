import React, { useState } from "react";
import Panel from "@shared/components/Panel";

const API_URL = import.meta.env.VITE_API_URL;

const BidderManagement = ({ productId, bids, onRefresh }) => {
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
      
      alert("Bidder rejected successfully.");
      if (onRefresh) onRefresh(); // Callback to reload the product data

    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!bids || bids.length === 0) return null;

  return (
    <Panel className="mt-6 p-6 bg-white rounded-xl shadow-sm border border-red-100">
      <h3 className="text-xl font-bold mb-4 text-red-800">🚫 Seller Controls: Manage Bidders</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-sm text-gray-500">
              <th className="py-2">Bidder</th>
              <th>Amount</th>
              <th>Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bids.map((bid) => (
              <tr key={bid.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-3 font-medium">{bid.bidder?.full_name || "****"}</td>
                <td className="text-green-600 font-bold">${bid.max_bid_amount}</td>
                <td className="text-sm text-gray-500">{new Date(bid.bid_time).toLocaleString()}</td>
                <td>
                  {bid.status !== 'rejected' ? (
                    <button
                        onClick={() => handleReject(bid.bidder.user_id)}
                        disabled={loading}
                        className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 transition"
                    >
                        Reject
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Banned</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
};

export default BidderManagement;
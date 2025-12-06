import VBox from "components/Shared/VBox";

const UserDetail = ({ user, onUpgradeRequest }) => {
  return (
    <VBox className="space-y-10"> {/* 2.5rem between sections */}
      <h2 className="text-2xl font-bold">{user.username}</h2>
      
      {/* Basic Info */}
      <VBox className="gap-4"> {/* 1rem between lines */}
        <h3 className="text-lg font-semibold">Activity Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-gray-700">
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Name:</strong> {user.name || "-"}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Address:</strong> {user.address || "-"}</p>
          <p><strong>Phone:</strong> {user.phone || "-"}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Status:</strong> {user.status}</p>
          <p><strong>Join Date:</strong> {user.join_date}</p>
        </div>
      </VBox>

      {/* Activity Summary */}
      <VBox className="gap-4">
        <h3 className="text-lg font-semibold">Activity Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-gray-700">
          <p><strong>Total Bids:</strong> {user.total_bids || 0}</p>
          <p><strong>Auctions Won:</strong> {user.auctions_won || 0}</p>
          <p><strong>Auctions Held:</strong> {user.auctions_held || 0}</p>
          <p><strong>Rating:</strong> {user.rating || 0}</p>
          <p><strong>Ratings Received:</strong> {user.ratings_received || 0}</p>
          <p><strong>Ratings Given:</strong> {user.ratings_given || 0}</p>
        </div>
      </VBox>

      {/* Activity History */}
      {user.activity_history && user.activity_history.length > 0 && (
        <VBox className="gap-4">
          <h3 className="text-lg font-semibold">Activity History</h3>
          <div className="max-h-64 overflow-y-auto border rounded">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="p-2 font-medium">Event</th>
                  <th className="p-2 font-medium">Date</th>
                  <th className="p-2 font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {user.activity_history.map((event, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="p-2">{event.event_type}</td>
                    <td className="p-2">{event.date}</td>
                    <td className="p-2">{event.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </VBox>
      )}

      {/* Actions */}
      <VBox className="gap-4">
        <div className="flex flex-wrap gap-4">
          <button className="flex-1 px-4 py-2 bg-lightGray hover:bg-primary/30 active:bg-primary/60 rounded transition">
            Suspend
          </button>
          <button className="flex-1 px-4 py-2 bg-lightGray hover:bg-primary/30 active:bg-primary/60 rounded transition">
            Ban
          </button>
          <button className="flex-1 px-4 py-2 bg-lightGray hover:bg-primary/30 active:bg-primary/60 rounded transition">
            Reset Password
          </button>
          <button className="flex-1 px-4 py-2 bg-lightGray hover:bg-primary/30 active:bg-primary/60 rounded transition">
            Force Logout
          </button>
        </div>

        <button
          onClick={() => onUpgradeRequest("User requested upgrade to seller.")}
          className="px-4 py-2 bg-lightGray rounded hover:bg-primary/30 active:bg-primary/60 transition"
        >
          View / Handle Upgrade Request
        </button>
      </VBox>
    </VBox>
  );
};

export default UserDetail;

import VBox from "@components/VBox";

const UserDetail = ({ user, isUpgradeView, onApprove, onReject, onClose }) => {
  return (
    <VBox className="space-y-10">
      {" "}
      {/* 2.5rem between sections */}
      <h2 className="text-2xl font-bold">{user.full_name}</h2>
      {/* Basic Info */}
      <VBox className="gap-4">
        {" "}
        {/* 1rem between lines */}
        <h3 className="text-lg font-semibold">Account Information</h3>
        <div className="grid grid-cols-2 gap-4 text-gray-700">
          <p>
            <strong>ID:</strong> {user.user_id}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Address:</strong> {user.address || "-"}
          </p>
          <p>
            <strong>Role:</strong> {user.role}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            {user.upgrade_request_time ? "Upgrade Requested" : "Normal"}
          </p>
          <p>
            <strong>Join Date:</strong> {user.join_date}
          </p>
        </div>
      </VBox>
      {/* Activity Summary */}
      <VBox className="gap-4">
        <h3 className="text-lg font-semibold">Activity Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-gray-700">
          <p>
            <strong>Total Bids:</strong> {user.total_bids || 0}
          </p>
          <p>
            <strong>Auctions Won:</strong> {user.auctions_won || 0}
          </p>
          <p>
            <strong>Auctions Held:</strong> {user.auctions_held || 0}
          </p>
          <p>
            <strong>Rating:</strong> {user.rating || 0}
          </p>
          <p>
            <strong>Ratings Received:</strong> {user.ratings_received || 0}
          </p>
          <p>
            <strong>Ratings Given:</strong> {user.ratings_given || 0}
          </p>
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
      {isUpgradeView && user.upgrade_request_time && (
        <VBox className="gap-4 pt-6 border-t">
          <h3 className="text-lg font-semibold">Upgrade Request</h3>

          <div className="flex gap-4">
            <button
              onClick={() => onReject(user)}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Deny
            </button>

            <button
              onClick={() => onApprove(user)}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Approve
            </button>
          </div>
        </VBox>
      )}
    </VBox>
  );
};

export default UserDetail;

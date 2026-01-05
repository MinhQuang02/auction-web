import { useState } from "react";
import { apiFetch } from "@utils/ApiFetch";
import VBox from "@components/VBox";
import HBox from "@components/HBox";

const API_URL = import.meta.env.VITE_API_URL;

const UserDetail = ({
  user,
  onApprove,
  onReject,
  onDowngrade,
  onSuspend,
  onUnsuspend,
  onClose,
  onSaved,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: user.full_name ?? "",
    address: user.address ?? "",
    dob: user.dob ? user.dob.slice(0, 10) : "",
    is_email_verified: user.is_email_verified,
    seller_expires: user.seller_expires ? user.seller_expires.slice(0, 10) : "",
  });

  const resetForm = () => {
    setForm({
      full_name: user.full_name ?? "",
      address: user.address ?? "",
      dob: user.dob ? user.dob.slice(0, 10) : "",
      is_email_verified: user.is_email_verified,
      seller_expires: user.seller_expires
        ? user.seller_expires.slice(0, 10)
        : "",
    });
  };

  const saveProfile = async () => {
    const payload = {};

    if (form.full_name) payload.full_name = form.full_name;
    if (form.address) payload.address = form.address;
    if (form.is_email_verified !== undefined)
      payload.is_email_verified = form.is_email_verified;

    if (form.dob) {
      payload.dob = new Date(form.dob).toISOString();
    }

    if (form.seller_expires) {
      payload.seller_expires = new Date(form.seller_expires).toISOString();
    }

    await apiFetch(`${API_URL}/api/admin/users/${user.user_id}/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setIsEditing(false);
    onClose();
    onSaved();
  };

  return (
    <VBox className="space-y-10">
      <h2 className="text-2xl font-bold">{user.full_name}</h2>

      <VBox className="gap-4">
        <HBox className="justify-between items-center">
          <h3 className="text-lg font-semibold">Account Information</h3>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1 border rounded text-sm"
            >
              Edit
            </button>
          ) : (
            <HBox className="gap-2">
              <button
                onClick={() => {
                  resetForm();
                  setIsEditing(false);
                }}
                className="px-3 py-1 border rounded text-sm"
              >
                Cancel
              </button>
              <button
                onClick={saveProfile}
                className="px-3 py-1 bg-primary text-white rounded text-sm"
              >
                Save
              </button>
            </HBox>
          )}
        </HBox>

        <div className="grid grid-cols-2 gap-4 text-gray-700">
          <p>
            <strong>ID:</strong> {user.user_id}
          </p>

          <p>
            <strong>Email:</strong> {user.email}
          </p>

          <p>
            <strong>Full Name:</strong>{" "}
            {!isEditing ? (
              user.full_name || "-"
            ) : (
              <input
                className="border px-2 py-1 rounded w-full"
                value={form.full_name}
                onChange={(e) =>
                  setForm({ ...form, full_name: e.target.value })
                }
              />
            )}
          </p>

          <p>
            <strong>Address:</strong>{" "}
            {!isEditing ? (
              user.address || "-"
            ) : (
              <textarea
                className="border px-2 py-1 rounded w-full"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            )}
          </p>

          <p>
            <strong>Date of Birth:</strong>{" "}
            {!isEditing ? (
              user.dob ? (
                new Date(user.dob).toLocaleDateString()
              ) : (
                "-"
              )
            ) : (
              <input
                type="date"
                className="border px-2 py-1 rounded"
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
              />
            )}
          </p>

          <p>
            <strong>Role:</strong> {user.role}
          </p>

          <p>
            <strong>Status:</strong>{" "}
            {user.upgrade_request_time ? "Upgrade Requested" : "Normal"}
          </p>

          <p>
            <strong>Join Date:</strong>{" "}
            {new Date(user.join_date).toLocaleDateString()}
          </p>

          {user.role === "seller" && (
            <p>
              <strong>Seller Expires:</strong>{" "}
              {!isEditing ? (
                user.seller_expires ? (
                  new Date(user.seller_expires).toLocaleDateString()
                ) : (
                  "-"
                )
              ) : (
                <input
                  type="date"
                  className="border px-2 py-1 rounded"
                  value={form.seller_expires}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      seller_expires: e.target.value,
                    })
                  }
                />
              )}
            </p>
          )}
        </div>
      </VBox>

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

      {user.products && user.products.length > 0 && (
        <VBox className="gap-3 pt-6 border-t">
          <h3 className="text-lg font-semibold">Products</h3>

          <div className="max-h-56 overflow-y-auto border rounded text-sm">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Role</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-right">Price</th>
                  <th className="p-2 text-left">Ended</th>
                </tr>
              </thead>

              <tbody>
                {user.products.map((p) => (
                  <tr key={p.product_id} className="border-t hover:bg-gray-50">
                    <td className="p-2 truncate max-w-[180px]">{p.name}</td>

                    <td className="p-2">
                      {p.seller_id === user.user_id
                        ? "Seller"
                        : p.winner_id === user.user_id
                        ? "Winner"
                        : "-"}
                    </td>

                    <td className="p-2 capitalize">
                      {p.status.replaceAll("_", " ")}
                    </td>

                    <td className="p-2 text-right">
                      ${Number(p.current_price).toFixed(2)}
                    </td>

                    <td className="p-2">
                      {p.end_time
                        ? new Date(p.end_time).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </VBox>
      )}

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

                    <td className="p-2">
                      {new Date(event.date).toLocaleString()}
                    </td>

                    <td className="p-2">{event.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </VBox>
      )}

      {(user.role === "bidder" || user.role === "seller") && (
        <VBox className="gap-4 pt-6 border-t">
          <h3 className="text-lg font-semibold">Role</h3>

          {user.role === "bidder" && (
            <>
              {user.upgrade_request_time && (
                <div className="text-gray-700 space-y-2">
                  <p>
                    <strong>Requested At:</strong>{" "}
                    {new Date(user.upgrade_request_time).toLocaleString()}
                  </p>
                  {user.upgrade_reason && (
                    <p>
                      <strong>Reason:</strong> {user.upgrade_reason}
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-4 pt-2">
                {user.upgrade_request_time ? (
                  <>
                    <button
                      onClick={() => onReject(user)}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded"
                    >
                      Deny
                    </button>
                    <button
                      onClick={() => onApprove(user)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded"
                    >
                      Approve
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onApprove(user)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded"
                  >
                    Upgrade to Seller
                  </button>
                )}
              </div>
            </>
          )}

          {user.role === "seller" && (
            <button
              onClick={() => onDowngrade(user)}
              className="w-full px-4 py-2 bg-red-600 text-white rounded"
            >
              Downgrade to Bidder
            </button>
          )}
        </VBox>
      )}

      {/* Administrative Actions Section */}
      <VBox className="gap-4 pt-6 border-t">
        <h3 className="text-lg font-semibold">Other</h3>

        {user.role !== "admin" && user.role !== "suspended" && (
          <button
            onClick={() => onSuspend(user)}
            className="w-full px-4 py-2 bg-red-700 text-white rounded"
          >
            Suspend User
          </button>
        )}

        {user.role === "suspended" && (
          <VBox className="gap-4 pt-2">
            <div className="px-4 py-2 bg-red-100 text-red-800 rounded">
              This user is suspended and cannot bid or sell.
            </div>

            <button
              onClick={() => onUnsuspend(user)}
              className="w-full px-4 py-2 bg-green-600 text-white rounded"
            >
              Unsuspend User
            </button>
          </VBox>
        )}

        {user.role !== "admin" && (
          <button
            onClick={async () => {
              if (!confirm("Reset this user's password and email it to them?"))
                return;

              await apiFetch(
                `${API_URL}/api/admin/users/${user.user_id}/reset-password`,
                { method: "POST" }
              );

              alert("Password has been reset and emailed to the user.");
            }}
            className="w-full px-4 py-2 bg-yellow-600 text-white rounded"
          >
            Reset Password
          </button>
        )}
      </VBox>
    </VBox>
  );
};

export default UserDetail;

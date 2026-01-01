import { useState } from "react";

import VBox from "@components/VBox";
import HBox from "@components/HBox";
import AdminSidebar from "@components/Sidebar/AdminSidebar";
import ActionBar from "@components/ActionBar";
import TablePanel from "@components/TablePanel";
import Modal from "@components/Modal";
import UserDetail from "./UserDetail";
import UpgradeRequestReview from "./UpgradeRequestReview";

const headers = [
  "ID",
  "Name",
  "Email",
  "Role",
  "Rating",
  "Join Date",
  "Status",
];

const users = [
  {
    user_id: 42,
    full_name: "Alice Johnson",
    email: "alice@example.com",
    role: "bidder",
    avg_rating: 4.8,
    created_at: "2024-01-15T00:00:00Z",
    upgrade_request_time: "2025-11-28T10:00:00Z",
    seller_expires: null,
  },
  {
    user_id: 43,
    full_name: "Bob Smith",
    email: "bob@example.com",
    role: "bidder",
    avg_rating: 4.2,
    created_at: "2024-02-01T00:00:00Z",
    upgrade_request_time: "2025-11-28T10:00:00Z",
    seller_expires: null,
  },
];

const UserManagement = () => {
  const [viewMode, setViewMode] = useState("all"); // "all" | "upgrade"
  const [selectedUser, setSelectedUser] = useState(null);
  const [upgradeRequestUser, setUpgradeRequestUser] = useState(null);

  const approveUpgrade = async (userId) => {
    // POST /admin/users/{id}/approve-upgrade
    console.log("Approve upgrade:", userId);
  };

  const denyUpgrade = async (userId) => {
    // POST /admin/users/{id}/deny-upgrade
    console.log("Deny upgrade:", userId);
  };

  function getUserStatus(user) {
    if (user.role === "seller" && user.seller_expires) {
      return new Date(user.seller_expires) > new Date()
        ? "Seller (Active)"
        : "Seller (Expired)";
    }

    if (user.upgrade_request_time) return "Upgrade Requested";

    return "Normal";
  }

  const filteredUsers =
    viewMode === "upgrade"
      ? users.filter(
          (u) => u.role === "bidder" && u.upgrade_request_time != null
        )
      : users;

  const tableRows = filteredUsers.map((u) => ({
    id: u.user_id,
    name: u.full_name ?? "-",
    email: u.email,
    role: u.role,
    rating: Number(u.avg_rating ?? 0),
    join_date: u.created_at ? new Date(u.created_at).toLocaleDateString() : "-",
    status: getUserStatus(u),
  }));

  const userById = new Map(users.map((u) => [u.user_id, u]));

  return (
    <VBox className="p-10 gap-40">
      <HBox className="gap-10">
        <AdminSidebar />
        <span className="text-6xl font-bold text-black self-center flex-grow">
          USERS
        </span>
      </HBox>

      <VBox>
        <ActionBar
          leftExtras={
            <>
              <button
                onClick={() => setViewMode("all")}
                className={`px-4 py-2 rounded ${
                  viewMode === "all" ? "bg-primary text-white" : "bg-lightGray"
                }`}
              >
                All Users
              </button>

              <button
                onClick={() => setViewMode("upgrade")}
                className={`px-4 py-2 rounded ${
                  viewMode === "upgrade"
                    ? "bg-primary text-white"
                    : "bg-lightGray"
                }`}
              >
                Upgrade Requests
              </button>
            </>
          }
        />

        <TablePanel
          headers={viewMode === "upgrade" ? [...headers, "Actions"] : headers}
          rows={tableRows}
          onRowClick={(row) => {
            const fullUser = userById.get(row.id);
            setSelectedUser(fullUser);
          }}
          renderActions={
            viewMode === "upgrade"
              ? (row) => (
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        approveUpgrade(row.id);
                      }}
                      className="px-3 py-1 bg-green-500 text-white rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        denyUpgrade(row.id);
                      }}
                      className="px-3 py-1 bg-red-500 text-white rounded"
                    >
                      Deny
                    </button>
                  </div>
                )
              : null
          }
        />

        {/* User Details Modal */}
        <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)}>
          {selectedUser && (
            <UserDetail
              user={selectedUser}
              onUpgradeRequest={(reason) =>
                setUpgradeRequestUser({ user: selectedUser, reason })
              }
            />
          )}
        </Modal>

        {/* Upgrade Request Modal */}
        {/* <UpgradeRequestReview
          isOpen={!!upgradeRequestUser}
          onClose={() => setUpgradeRequestUser(null)}
          user={upgradeRequestUser?.user}
          requestReason={upgradeRequestUser?.reason}
          onApprove={() => {
            console.log("Approved:", upgradeRequestUser.user.username);
            setUpgradeRequestUser(null);
          }}
          onReject={() => {
            console.log("Rejected:", upgradeRequestUser.user.username);
            setUpgradeRequestUser(null);
          }}
        /> */}
      </VBox>
    </VBox>
  );
};

export default UserManagement;

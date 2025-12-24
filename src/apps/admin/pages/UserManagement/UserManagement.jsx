import { useState } from "react";

import VBox from "@shared/components/VBox";
import HBox from "@shared/components/HBox";
import AdminSidebar from "@shared/components/Sidebar/AdminSidebar";
import ActionBar from "@shared/components/ActionBar";
import TablePanel from "@shared/components/TablePanel";
import Modal from "@shared/components/Modal";
import UserDetail from "./UserDetail";
import UpgradeRequestReview from "./UpgradeRequestReview";

const headers = [
  "ID",
  "Username",
  "Email",
  "Role",
  "Rating",
  "Join Date",
  "Status",
  "Last Active",
];

// Example user list
const users = [
  {
    id: 42,
    username: "Alice123",
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    address: "123 Maple Street, Springfield",
    phone: "+1 555-123-4567",
    role: "User",
    status: "Active",
    join_date: "2024-01-15",
    total_bids: 27,
    auctions_won: 5,
    auctions_held: 2,
    rating: 4.8,
    ratings_received: 12,
    ratings_given: 15,
    activity_history: [
      {
        event_type: "Login",
        date: "2025-11-29 10:15",
        details: "User logged in from IP 192.168.0.12",
      },
      {
        event_type: "Bid Placed",
        date: "2025-11-29 11:00",
        details: "Placed a bid of $250 on 'Vintage Watch'",
      },
      {
        event_type: "Auction Created",
        date: "2025-11-28 14:22",
        details: "Created auction for 'Rare Comic Book'",
      },
      {
        event_type: "Password Reset",
        date: "2025-11-27 09:30",
        details: "User reset password via email link",
      },
      {
        event_type: "Logout",
        date: "2025-11-29 12:45",
        details: "User logged out",
      },
    ],
    upgrade_request: {
      reason: "Request to become a verified seller.",
      status: "Pending",
    },
  },
  {
    id: 2,
    username: "BobAdmin",
    email: "bob@example.com",
    role: "Admin",
    rating: 5.0,
    join_date: "2023-06-02",
    status: "Active",
    last_active: "2025-11-30 13:50",
  },
  // ... more users
];

const UserManagement = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [upgradeRequestUser, setUpgradeRequestUser] = useState(null);

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
          onFilter={() => {}}
          onSearch={() => {}}
          onAdd={() => {}}
          onRemove={() => {}}
          onEdit={() => {}}
        />

        <TablePanel
          headers={headers}
          rows={users}
          onRowClick={(row) => setSelectedUser(row)}
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
        <UpgradeRequestReview
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
        />
      </VBox>
    </VBox>
  );
};

export default UserManagement;

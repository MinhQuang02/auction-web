import { useState, useEffect } from "react";
import VBox from "@components/VBox";
import HBox from "@components/HBox";
import AdminSidebar from "@components/Sidebar/AdminSidebar";
import TablePanel from "@components/TablePanel";
import Modal from "@components/Modal";
import UserDetail from "./UserDetail";
import UpgradeRequestReview from "./UpgradeRequestReview";

const API_URL = import.meta.env.VITE_API_URL;

const UserManagement = () => {
  const [users, setUsers] = useState([]); // Real users
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [upgradeRequestUser, setUpgradeRequestUser] = useState(null);

  // Fetch Users who requested upgrade
  const fetchPendingRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/upgrades/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      // Transform data to match Table format
      const formattedUsers = data.map(u => ({
         id: u.user_id,
         username: u.full_name,
         email: u.email,
         role: u.role,
         status: "Pending Upgrade", // Custom status
         request_time: new Date(u.upgrade_request_time).toLocaleDateString(),
         raw: u // Keep raw data for modal
      }));

      setUsers(formattedUsers);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const handleApprove = async () => {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/api/upgrades/approve`, {
          method: "POST",
          headers: { 
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ userId: upgradeRequestUser.raw.user_id })
      });
      setUpgradeRequestUser(null);
      fetchPendingRequests(); // Refresh list
  };

  const handleReject = async () => {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/api/upgrades/reject`, {
          method: "POST",
          headers: { 
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ userId: upgradeRequestUser.raw.user_id })
      });
      setUpgradeRequestUser(null);
      fetchPendingRequests(); // Refresh list
  };

  return (
    <VBox className="p-10 gap-40">
      <HBox className="gap-10">
        <AdminSidebar />
        <span className="text-6xl font-bold text-black self-center flex-grow">
          UPGRADE REQUESTS
        </span>
      </HBox>

      <VBox>
        {loading ? <p>Loading...</p> : (
            <TablePanel
              headers={["ID", "Name", "Email", "Role", "Request Date"]}
              rows={users}
              onRowClick={(row) => setUpgradeRequestUser({ 
                  user: { username: row.username, id: row.id, role: row.role }, 
                  reason: "User requested upgrade via profile.", // Placeholder reason until DB updated
                  raw: row.raw 
              })}
            />
        )}

        {/* Upgrade Review Modal */}
        <UpgradeRequestReview
          isOpen={!!upgradeRequestUser}
          onClose={() => setUpgradeRequestUser(null)}
          user={upgradeRequestUser?.user}
          requestReason={upgradeRequestUser?.reason}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </VBox>
    </VBox>
  );
};

export default UserManagement;
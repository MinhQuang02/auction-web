import { useState, useEffect } from "react";
import VBox from "@components/VBox";
import HBox from "@components/HBox";
import AdminSidebar from "@components/Sidebar/AdminSidebar";
import ActionBar from "@components/ActionBar";
import TablePanel from "@components/TablePanel";
import Modal from "@components/Modal";
import UserDetail from "./UserDetail";

const API_URL = import.meta.env.VITE_API_URL;

const headers = [
  "ID",
  "Name",
  "Email",
  "Role",
  "Rating",
  "Join Date",
  "Status",
];

const UserManagement = () => {
  const PAGE_SIZE = 10;

  const [viewMode, setViewMode] = useState("all");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("");
  const [hasMore, setHasMore] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    setPage(0);
  }, [viewMode, search, role, status, sortBy]);

  const refreshCurrentView = () => {
    setSelectedUser(null);
    viewMode === "upgrade" ? fetchUpgradeRequests() : fetchUsers();
  };

  const fetchUsers = async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page,
        limit: PAGE_SIZE,
      });

      if (search) params.set("keyword", search);
      if (role !== "all") params.set("role", role);
      if (sortBy) params.set("sort_by", sortBy);

      const res = await fetch(`${API_URL}/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setUsers(data);
      setHasMore(data.length === PAGE_SIZE);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetail = async (userId) => {
    setIsDetailOpen(true);
    setSelectedUser(null);

    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch user detail");

      const data = await res.json();
      setSelectedUser(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUpgradeRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/upgrades/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch upgrade requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    viewMode === "upgrade" ? fetchUpgradeRequests() : fetchUsers();
  }, [viewMode, page, search, role, status, sortBy]);

  const approveUpgrade = async (user) => {
    await fetch(`${API_URL}/api/upgrades/approve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId: user.user_id }),
    });

    refreshCurrentView();
  };

  const denyUpgrade = async (user) => {
    await fetch(`${API_URL}/api/upgrades/reject`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId: user.user_id }),
    });

    refreshCurrentView();
  };

  const getUserStatus = (u) => {
    if (u.upgrade_request_time) return "Upgrade Requested";
    if (u.role === "seller" && u.seller_expires)
      return new Date(u.seller_expires) > new Date()
        ? "Seller (Active)"
        : "Seller (Expired)";
    return "Normal";
  };

  const tableRows = users.map((u) => ({
    id: u.user_id,
    name: u.full_name ?? "-",
    email: u.email,
    role: u.role,
    rating: Number(u.avg_rating ?? 0),
    join_date: u.created_at ? new Date(u.created_at).toLocaleDateString() : "-",
    status: getUserStatus(u),
    raw: u,
  }));

  return (
    <VBox className="p-10 gap-40">
      <HBox className="gap-10">
        <AdminSidebar />
        <span className="text-6xl font-bold flex-grow">USERS</span>
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
          rightExtras={
            <HBox className="gap-3 items-center">
              {/* Search */}
              <input
                type="text"
                placeholder="Search name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-2 border rounded w-60"
              />

              {/* Role filter */}
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="px-3 py-2 border rounded"
              >
                <option value="all">All Roles</option>
                <option value="bidder">Bidder</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>

              {/* Status filter */}
              {/* <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-3 py-2 border rounded"
              >
                <option value="all">All Status</option>
                <option value="upgrade">Upgrade Requested</option>
                <option value="seller_active">Seller (Active)</option>
                <option value="seller_expired">Seller (Expired)</option>
              </select> */}

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border rounded"
              >
                <option value="">Newest First</option>
                <option value="created_at_asc">Oldest First</option>
                <option value="rating_desc">Rating (High → Low)</option>
                <option value="rating_asc">Rating (Low → High)</option>
              </select>
            </HBox>
          }
        />

        <>
          <TablePanel
            headers={headers}
            rows={tableRows}
            onRowClick={(row) => fetchUserDetail(row.raw.user_id)}
          />

          {loading && (
            <p className="mt-2 text-sm text-gray-500 text-center">Updating…</p>
          )}

          <HBox className="justify-center items-center mt-4 gap-4">
            <button
              disabled={page === 0 || loading}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Previous
            </button>

            <span className="text-sm text-gray-600">Page {page + 1}</span>

            <button
              disabled={!hasMore || loading}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </HBox>
        </>

        {/* User detail */}
        <Modal
          isOpen={isDetailOpen}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedUser(null);
          }}
        >
          {!selectedUser ? (
            <p className="p-6">Loading user details...</p>
          ) : (
            <UserDetail
              user={selectedUser}
              isUpgradeView={viewMode === "upgrade"}
              onApprove={approveUpgrade}
              onReject={denyUpgrade}
            />
          )}
        </Modal>
      </VBox>
    </VBox>
  );
};

export default UserManagement;

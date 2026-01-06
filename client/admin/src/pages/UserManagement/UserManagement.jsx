import { useState, useEffect } from "react";
import VBox from "@components/VBox";
import HBox from "@components/HBox";
import AdminSidebar from "@components/Sidebar/AdminSidebar";
import ActionBar from "@components/ActionBar";
import TablePanel from "@components/TablePanel";
import Modal from "@components/Modal";
import CreateUser from "./CreateUser";
import UserDetail from "./UserDetail";
import Panel from "@components/Panel";
import Pagination from "@components/Pagination";

import { apiFetch } from "@utils/ApiFetch.jsx";

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

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [queryVersion, setQueryVersion] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("");
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    pendingUpgrades: 0,
  });

  const fetchUserStats = async () => {
    try {
      const res = await apiFetch(`${API_URL}/api/admin/users/stats`);
      if (res.ok) {
        const data = await res.json();
        setUserStats(data);
      }
    } catch (e) {
      console.error("Failed to fetch user stats", e);
    }
  };

  const refreshCurrentView = () => {
    setIsDetailOpen(false);
    setSelectedUser(null);
    fetchUserStats();
    fetchUsers();
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
      if (status === "upgrade") {
        params.set("upgrade_requested", "true");
      }
      if (sortBy) params.set("sort_by", sortBy);

      const res = await apiFetch(`${API_URL}/api/admin/users?${params}`);

      if (res.ok) {
        const json = await res.json();
        const items = Array.isArray(json.items) ? json.items : [];
        const total = typeof json.total === 'number' ? json.total : 0;

        setUsers(items);
        setTotalPages(Math.ceil(total / PAGE_SIZE));
      } else {
        setUsers([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetail = async (userId) => {
    setIsDetailOpen(true);
    setSelectedUser(null);

    try {
      const res = await apiFetch(`${API_URL}/api/admin/users/${userId}`);

      if (!res.ok) throw new Error("Failed to fetch user detail");

      const data = await res.json();
      console.log(data);
      setSelectedUser(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [page, queryVersion]);

  useEffect(() => {
    setPage(0);
    setQueryVersion((v) => v + 1);
  }, [search, role, status, sortBy]);

  const approveUpgrade = async (user) => {
    await apiFetch(`${API_URL}/api/upgrades/approve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: user.user_id }),
    });

    refreshCurrentView();
  };

  const denyUpgrade = async (user) => {
    await apiFetch(`${API_URL}/api/upgrades/reject`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: user.user_id }),
    });

    refreshCurrentView();
  };

  const downgradeSeller = async (user) => {
    if (!confirm(`Downgrade ${user.full_name} to bidder?`)) return;

    await apiFetch(`${API_URL}/api/admin/users/downgrade`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: user.user_id }),
    });

    refreshCurrentView();
  };

  const suspendUser = async (user) => {
    if (
      !confirm(
        `Suspend ${user.full_name}? This will disable selling and bidding.`
      )
    ) {
      return;
    }

    await apiFetch(`${API_URL}/api/admin/users/suspend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.user_id }),
    });

    refreshCurrentView();
  };

  const unsuspendUser = async (user) => {
    if (!confirm(`Re-activate ${user.full_name}?`)) return;

    await apiFetch(`${API_URL}/api/admin/users/unsuspend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    <VBox className="px-6 py-8 lg:px-10 gap-8 font-sans text-gray-800">
      <HBox className="gap-10">
        <AdminSidebar />

        <div className="flex-grow flex items-center justify-center">
          <Panel className="w-full max-w-sm rounded-2xl overflow-hidden p-0">
            <VBox>
              <div className="bg-primary/60 px-8 py-5 text-center">
                <span className="text-3xl font-bold tracking-wide text-black">
                  USERS
                </span>
              </div>

              <div className="bg-gray-100 px-8 py-5">
                <div className="grid grid-cols-2 text-center">
                  <div className="pr-6">
                    <div className="text-sm text-gray-600">Total Users</div>
                    <div className="text-3xl font-semibold text-black">
                      {userStats.totalUsers}
                    </div>
                  </div>

                  <div className="pl-6 border-l border-gray-300">
                    <div className="text-sm text-gray-600">
                      Pending Upgrades
                    </div>
                    <div className="text-3xl font-semibold text-black">
                      {userStats.pendingUpgrades}
                    </div>
                  </div>
                </div>
              </div>
            </VBox>
          </Panel>
        </div>
      </HBox>

      <VBox className="gap-4">
        <ActionBar
          onAdd={() => setIsCreateOpen(true)}
          leftExtras={
            <HBox className="gap-3 items-center">
              {/* Search */}
              <input
                type="text"
                placeholder="Search name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-2 border rounded w-60 shadow-lg"
              />

              {/* Role filter */}
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="px-3 py-2 border rounded shadow-lg"
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
                className="px-3 py-2 border rounded shadow-lg"
              >
                <option value="">Newest First</option>
                <option value="created_at_asc">Oldest First</option>
                <option value="rating_desc">Rating (High → Low)</option>
                <option value="rating_asc">Rating (Low → High)</option>
              </select>

              <button
                onClick={() => setStatus("all")}
                className={`px-4 py-2 rounded shadow-lg ${status === "all" ? "bg-primary text-white" : "bg-lightGray"
                  }`}
              >
                All Users
              </button>

              <button
                onClick={() => setStatus("upgrade")}
                className={`px-4 py-2 rounded shadow-lg ${status === "upgrade"
                    ? "bg-primary text-white"
                    : "bg-lightGray"
                  }`}
              >
                Upgrade Requests
              </button>
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

          <Pagination
            currentPage={page + 1}
            totalPages={totalPages}
            onPrev={() => setPage((p) => Math.max(0, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            onSelect={(p) => setPage(p - 1)}
          />
        </>

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
              onApprove={approveUpgrade}
              onReject={denyUpgrade}
              onDowngrade={downgradeSeller}
              onSuspend={suspendUser}
              onUnsuspend={unsuspendUser}
              onClose={() => {
                setIsDetailOpen(false);
                setSelectedUser(null);
              }}
              onSaved={refreshCurrentView}
            />
          )}
        </Modal>

        <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)}>
          <div className="flex items-center justify-center min-h-[60vh]">
            <CreateUser
              onSuccess={() => {
                setIsCreateOpen(false);
                refreshCurrentView();
              }}
            />
          </div>
        </Modal>
      </VBox>
    </VBox>
  );
};

export default UserManagement;

import { useState, useEffect, useMemo } from "react";
import VBox from "@components/VBox";
import HBox from "@components/HBox";
import AdminSidebar from "@components/Sidebar/AdminSidebar";
import AuctionActionBar from "./AuctionActionBar";
import TablePanel from "@components/TablePanel";
import Modal from "@components/Modal";
import AuctionDetail from "./AuctionDetail";
import AuctionEditForm from "./AuctionEditForm";

import { apiFetch } from "@utils/ApiFetch.jsx";

const API_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem("token");

const headers = [
  "ID",
  "Product",
  "Seller",
  "Category",
  "Status",
  "Time Left",
  "Current Price",
];

const formatTimeLeft = (endTime) => {
  const diff = new Date(endTime) - new Date();
  if (diff <= 0) return "Ended";
  const h = Math.floor(diff / 36e5);
  const m = Math.floor((diff % 36e5) / 6e4);
  return `${h}h ${m}m`;
};

const getCurrentPrice = (product) => {
  if (!product.bids || product.bids.length === 0) {
    return product.start_price;
  }
  return Math.max(...product.bids.map((b) => b.max_bid_amount));
};

const AuctionManagement = () => {
  const PAGE_SIZE = 10;

  const [products, setProducts] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("");
  const [editAuction, setEditAuction] = useState(null);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchProducts = async () => {
    const params = new URLSearchParams({
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    });

    if (search) params.set("keyword", search);
    if (status !== "all") params.set("status", status);
    if (sortBy) params.set("sort_by", sortBy);

    const res = await apiFetch(`${API_URL}/api/products?${params}`);
    const data = await res.json();

    setProducts(data);
    setHasMore(data.length === PAGE_SIZE);
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search, status, sortBy]);

  useEffect(() => {
    setPage(0);
  }, [search, status, sortBy]);

  const rows = useMemo(() => {
    return products.map((p) => ({
      id: p.product_id,
      product: p.name,
      seller: p.seller?.full_name ?? "-",
      category: p.category?.name ?? "-",
      status: p.status,
      time_left: formatTimeLeft(p.end_time),
      current_price: getCurrentPrice(p),
      __raw: p,
    }));
  }, [products]);

  const openDetail = async (productId) => {
    const res = await apiFetch(`${API_URL}/api/products/${productId}`);
    const data = await res.json();
    setSelectedDetail(data.product);
  };

  const removeProduct = async (productId) => {
    try {
      const res = await apiFetch(`${API_URL}/api/admin/products/${productId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log(res);

      if (!res.ok) {
        const err = await res.json();
        alert(err.message);
        return;
      }

      fetchProducts();
      setSelectedRow(null);
    } catch (e) {
      alert("Failed to remove product");
    }
  };

  const openEdit = async (productId) => {
    const res = await apiFetch(`${API_URL}/api/products/${productId}`);
    const data = await res.json();
    setEditAuction(data.product);
  };

  return (
    <VBox className="p-10 gap-40">
      <HBox className="gap-10">
        <AdminSidebar />
        <span className="text-6xl font-bold flex-grow">AUCTIONS</span>
      </HBox>

      <VBox>
        <AuctionActionBar
          search={search}
          status={status}
          sortBy={sortBy}
          onSearch={setSearch}
          onStatusChange={setStatus}
          onSortChange={setSortBy}
          onRemove={() => selectedRow && removeProduct(selectedRow.id)}
          onEdit={() => selectedRow && openEdit(selectedRow.id)}
        />

        <TablePanel
          headers={headers}
          rows={rows}
          selectedRowId={selectedRow?.id}
          onRowClick={(row) => {
            setSelectedRow(row); // single click = select only
          }}
          onRowDoubleClick={(row) => {
            openDetail(row.id); // double click = open modal
          }}
        />

        <HBox className="justify-center items-center mt-4">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-sm text-gray-600">Page {page + 1}</span>

          <button
            disabled={!hasMore}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </HBox>

        <Modal
          isOpen={!!selectedDetail}
          onClose={() => setSelectedDetail(null)}
        >
          {selectedDetail && <AuctionDetail auction={selectedDetail} />}
        </Modal>
        <Modal isOpen={!!editAuction} onClose={() => setEditAuction(null)}>
          {editAuction && (
            <AuctionEditForm
              auction={editAuction}
              onSaved={() => {
                setEditAuction(null);
                fetchProducts();
              }}
            />
          )}
        </Modal>
      </VBox>
    </VBox>
  );
};

export default AuctionManagement;

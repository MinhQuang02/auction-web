import { useState, useEffect, useMemo } from "react";
import VBox from "@components/VBox";
import HBox from "@components/HBox";
import AdminSidebar from "@components/Sidebar/AdminSidebar";
import AuctionActionBar from "./AuctionActionBar";
import TablePanel from "@components/TablePanel";
import Modal from "@components/Modal";
import AuctionDetail from "./AuctionDetail";
import AuctionEditForm from "./AuctionEditForm";
import Panel from "@components/Panel";
import Pagination from "@components/Pagination";

import { apiFetch } from "@utils/ApiFetch.jsx";

const API_URL = import.meta.env.VITE_API_URL;

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

  const [auctionStats, setAuctionStats] = useState({
    active: 0,
    endingSoon24h: 0,
  });
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [categoryId, setCategoryId] = useState("all");
  const [sortBy, setSortBy] = useState("");
  const [editAuction, setEditAuction] = useState(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    apiFetch(`${API_URL}/api/products/admin/stats`)
      .then((res) => res.json())
      .then(setAuctionStats)
      .catch(console.error);
  }, []);

  useEffect(() => {
    apiFetch(`${API_URL}/api/categories`)
      .then((res) => res.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  const fetchProducts = async () => {
    const params = new URLSearchParams({
      limit: PAGE_SIZE,
      page: page + 1,
    });

    if (search) params.set("keyword", search);
    if (status !== "all") params.set("status", status);
    if (categoryId !== "all") params.set("category_id", categoryId);
    if (sortBy) params.set("sort_by", sortBy);

    const res = await apiFetch(`${API_URL}/api/products?${params}`);
    const { products, total } = await res.json();

    console.log(products);
    console.log(total);

    setProducts(products);
    setTotalPages(Math.ceil(total / PAGE_SIZE));
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search, status, categoryId, sortBy]);

  useEffect(() => {
    setPage(0);
  }, [search, status, categoryId, sortBy]);

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
    <VBox className="px-6 py-8 lg:px-10 gap-8 font-sans text-gray-800">
      <HBox className="gap-10">
        <AdminSidebar />

        <div className="flex-grow flex items-center justify-center">
          <Panel className="w-full max-w-sm rounded-2xl overflow-hidden p-0">
            <VBox>
              <div className="bg-primary/60 px-8 py-5 text-center">
                <span className="text-3xl font-bold tracking-wide text-black">
                  AUCTIONS
                </span>
              </div>

              <div className="bg-gray-100 px-8 py-5">
                <div className="grid grid-cols-2 text-center">
                  <div className="pr-6">
                    <div className="text-sm text-gray-600">Active</div>
                    <div className="text-3xl font-semibold text-black">
                      {auctionStats.active}
                    </div>
                  </div>

                  <div className="pl-6 border-l border-gray-300">
                    <div className="text-sm text-gray-600">Ending ≤ 24h</div>
                    <div className="text-3xl font-semibold text-black">
                      {auctionStats.endingSoon24h}
                    </div>
                  </div>
                </div>
              </div>
            </VBox>
          </Panel>
        </div>
      </HBox>

      <VBox className="gap-4">
        <AuctionActionBar
          search={search}
          status={status}
          sortBy={sortBy}
          categoryId={categoryId}
          categories={categories}
          onSearch={setSearch}
          onStatusChange={setStatus}
          onSortChange={setSortBy}
          onCategoryChange={setCategoryId}
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

        <Pagination
          currentPage={page + 1}
          totalPages={totalPages}
          onPrev={() => setPage((p) => Math.max(0, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          onSelect={(p) => setPage(p - 1)}
        />

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

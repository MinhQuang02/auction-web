import { useState } from "react";
import { apiFetch } from "@utils/ApiFetch.jsx";

const API_URL = import.meta.env.VITE_API_URL;

const toLocalDateTimeInput = (dateString) => {
  const date = new Date(dateString);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date - offset).toISOString().slice(0, 16);
};

const AuctionEditForm = ({ auction, onSaved }) => {
  const [form, setForm] = useState({
    name: auction.name,
    end_time: toLocalDateTimeInput(auction.end_time),
    buy_now_price: auction.buy_now_price ?? "",
    status: auction.status,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const submit = async () => {
    const utcEndTime = new Date(form.end_time).toISOString();

    const res = await apiFetch(
      `${API_URL}/api/admin/products/${auction.product_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          end_time: utcEndTime,
          buy_now_price: form.buy_now_price || null,
          status: form.status,
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      alert(err.message);
      return;
    }

    onSaved();
  };

  return (
    <div className="space-y-5 p-4">
      <h2 className="text-xl font-bold">Edit Auction</h2>

      {/* Product Name */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Product Name
        </label>
        <input
          className="w-full border p-2 rounded"
          name="name"
          value={form.name}
          onChange={handleChange}
        />
      </div>

      {/* End Time */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Auction End Time
        </label>
        <input
          type="datetime-local"
          name="end_time"
          value={form.end_time}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
      </div>

      {/* Buy Now Price */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Buy Now Price
        </label>
        <input
          type="number"
          name="buy_now_price"
          value={form.buy_now_price}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="Leave empty to disable"
        />
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={submit}
          className="px-4 py-2 bg-primary text-white rounded"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default AuctionEditForm;

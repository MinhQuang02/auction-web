import { useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

import VBox from "@components/VBox";
import HBox from "@components/HBox";

const API_URL = import.meta.env.VITE_API_URL;

const CreateAuction = ({ onClose, onCreated }) => {
  const quillRef = useRef(null);
  const quillInstance = useRef(null);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    seller_id: "",
    name: "",
    category_id: "",
    start_price: "",
    step_price: "",
    buy_now_price: "",
    end_time: "",
    auto_extend_enabled: false,
    images: ["", "", ""],
  });

  const [description, setDescription] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/categories/subcategory`)
      .then((r) => r.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!quillRef.current) return;

    quillRef.current.innerHTML = "";
    const el = document.createElement("div");
    quillRef.current.appendChild(el);

    const q = new Quill(el, {
      theme: "snow",
      placeholder: "Describe the product...",
      modules: {
        toolbar: [
          [{ header: [1, 2, false] }],
          ["bold", "italic", "underline"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["clean"],
        ],
      },
    });

    q.on("text-change", () => {
      setDescription(q.root.innerHTML);
    });

    quillInstance.current = q;
    return () => (quillInstance.current = null);
  }, []);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const updateImage = (i, v) => {
    const arr = [...form.images];
    arr[i] = v;
    update("images", arr);
  };

  const submit = async () => {
    setError("");

    if (!form.seller_id) return setError("Seller ID is required");
    if (!form.name) return setError("Product name is required");
    if (!form.category_id) return setError("Category is required");

    const validImages = form.images.filter((i) => i.trim());
    if (validImages.length < 3)
      return setError("At least 3 image URLs are required");

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...form,
          seller_id: Number(form.seller_id),
          start_price: Number(form.start_price),
          step_price: Number(form.step_price),
          buy_now_price: form.buy_now_price ? Number(form.buy_now_price) : null,
          description,
          images: validImages,
        }),
      });

      if (!res.ok) throw new Error("Failed to create product");

      onCreated?.();
      onClose();
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <VBox className="gap-4">
      <HBox className="justify-between items-center">
        <h2 className="text-2xl font-bold">Create Product</h2>
      </HBox>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>
      )}

      <VBox className="gap-6">
        <VBox>
          <label className="font-semibold">Seller ID</label>
          <input
            className="border rounded p-2"
            value={form.seller_id}
            onChange={(e) => update("seller_id", e.target.value)}
          />
        </VBox>

        <VBox>
          <label className="font-semibold">Product Name</label>
          <input
            className="border rounded p-2"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </VBox>

        <VBox>
          <label className="font-semibold">Category</label>
          <select
            className="border rounded p-2"
            value={form.category_id}
            onChange={(e) => update("category_id", e.target.value)}
          >
            <option value="">Select</option>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>
                {c.name}
              </option>
            ))}
          </select>
        </VBox>

        <VBox>
          <label className="font-semibold">Description</label>
          <div className="border rounded h-[220px] overflow-hidden flex flex-col">
            <div ref={quillRef} className="flex-1" />
          </div>
        </VBox>

        <VBox>
          <label className="font-semibold">Image URLs (min 3)</label>
          {form.images.map((img, i) => (
            <input
              key={i}
              className="border rounded p-2 mb-2"
              placeholder={`Image ${i + 1}`}
              value={img}
              onChange={(e) => updateImage(i, e.target.value)}
            />
          ))}
        </VBox>

        <div className="grid grid-cols-2 gap-4">
          <VBox>
            <label>Start Price</label>
            <input
              type="number"
              className="border rounded p-2"
              onChange={(e) => update("start_price", e.target.value)}
            />
          </VBox>
          <VBox>
            <label>Step Price</label>
            <input
              type="number"
              className="border rounded p-2"
              onChange={(e) => update("step_price", e.target.value)}
            />
          </VBox>
          <VBox>
            <label>Buy Now</label>
            <input
              type="number"
              className="border rounded p-2"
              onChange={(e) => update("buy_now_price", e.target.value)}
            />
          </VBox>
          <VBox>
            <label>End Time</label>
            <input
              type="datetime-local"
              className="border rounded p-2"
              onChange={(e) => update("end_time", e.target.value)}
            />
          </VBox>
        </div>
      </VBox>

      <HBox className="justify-end gap-3 pt-4 border-t">
        <button onClick={onClose} className="px-4 py-2 border rounded">
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create Product"}
        </button>
      </HBox>
    </VBox>
  );
};

export default CreateAuction;

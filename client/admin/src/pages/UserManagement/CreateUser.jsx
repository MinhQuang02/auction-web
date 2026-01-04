import { useState } from "react";
import { apiFetch } from "@utils/ApiFetch.jsx";

const API_URL = import.meta.env.VITE_API_URL;

const CreateUser = ({ onSuccess }) => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    address: "",
    email: "",
    password: "",
    dob: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (
      !form.firstName ||
      !form.lastName ||
      !form.email ||
      !form.password ||
      !form.dob
    )
      return "Missing required fields";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Invalid email";

    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(form.password)) {
      return "Password must be at least 8 characters and include a number.";
    }

    if (new Date(form.dob) >= new Date()) return "DOB must be in the past";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const err = validate();
    if (err) return setError(err);

    setLoading(true);

    try {
      const res = await apiFetch(`${API_URL}/api/admin/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: `${form.firstName} ${form.lastName}`,
          address: form.address,
          email: form.email,
          password: form.password,
          dob: form.dob,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Create failed");
      }

      onSuccess();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 px-8 py-6 w-[420px] font-sans text-gray-800"
    >
      <h2 className="text-2xl font-semibold tracking-tight">Create User</h2>

      {error && (
        <div className="rounded bg-red-100 text-red-800 px-4 py-2 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <div className="relative w-1/2">
          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            className="w-full h-[48px] border border-gray-300 rounded px-3 text-sm outline-none focus:border-primary"
          />
          <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-gray-400">
            First Name
          </label>
        </div>

        <div className="relative w-1/2">
          <input
            type="text"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            className="w-full h-[48px] border border-gray-300 rounded px-3 text-sm outline-none focus:border-primary"
          />
          <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-gray-400">
            Last Name
          </label>
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          name="address"
          value={form.address}
          onChange={handleChange}
          className="w-full h-[48px] border border-gray-300 rounded px-3 text-sm outline-none focus:border-primary"
        />
        <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-gray-400">
          Address
        </label>
      </div>

      <div className="relative">
        <input
          type="date"
          name="dob"
          value={form.dob}
          onChange={handleChange}
          className="w-full h-[48px] border border-gray-300 rounded px-3 text-sm outline-none focus:border-primary"
        />
        <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-gray-400">
          Date of Birth
        </label>
      </div>

      <div className="relative">
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="w-full h-[48px] border border-gray-300 rounded px-3 text-sm outline-none focus:border-primary"
        />
        <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-gray-400">
          Email
        </label>
      </div>

      <div className="relative">
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          className="w-full h-[48px] border border-gray-300 rounded px-3 text-sm outline-none focus:border-primary"
        />
        <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-gray-400">
          Password
        </label>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full h-[48px] rounded bg-primary text-white font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          Create User
        </button>
      </div>
    </form>
  );
};

export default CreateUser;

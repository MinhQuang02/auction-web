import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: location.state?.email || "",
    otp: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!form.email || !form.otp) {
      setErrorMessage("Email and verification code are required.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Verification failed");
      }

      setSuccessMessage("Email verified successfully. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="bg-[#F4F4F4] min-h-screen w-full flex items-center justify-center p-4 lg:p-6 text-[#1F1F1F] font-sans">
      <div className="w-full max-w-[520px] bg-white rounded-[32px] shadow-xl p-10">
        <h1 className="text-3xl font-bold mb-2 tracking-tight">
          Verify your email
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          Enter the 6-digit code we sent to your email.
        </p>

        <div className="mb-4 min-h-[48px]">
          {successMessage && (
            <div className="rounded bg-green-100 text-green-800 px-4 py-2 text-sm">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="rounded bg-red-100 text-red-800 px-4 py-2 text-sm">
              {errorMessage}
            </div>
          )}
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="relative">
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full h-[52px] bg-transparent border border-gray-300 rounded px-4 text-sm outline-none focus:border-[#A3907B]"
            />
            <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-gray-400">
              Email
            </label>
          </div>

          {/* OTP */}
          <div className="relative">
            <input
              type="text"
              value={form.otp}
              onChange={(e) => setForm({ ...form, otp: e.target.value })}
              maxLength={6}
              className="w-full h-[52px] bg-transparent border border-gray-300 rounded px-4 text-sm outline-none focus:border-[#A3907B]"
            />
            <label className="absolute -top-2.5 left-3 bg-white px-1 text-xs text-gray-400">
              Verification code
            </label>
          </div>

          <button
            type="submit"
            className="w-full h-[50px] bg-[#AD9C86] hover:bg-[#968672] text-white font-medium rounded text-sm transition shadow-sm"
          >
            Verify email
          </button>

          <div className="text-center text-sm text-gray-500 mt-4">
            Entered wrong email?{" "}
            <Link to="/signup" className="underline hover:text-black">
              Sign up again
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;

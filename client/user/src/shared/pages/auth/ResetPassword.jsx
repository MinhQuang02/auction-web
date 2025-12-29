import React, { useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const onlineImage =
    "https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?q=80&w=2670&auto=format&fit=crop";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      if (!res.ok) {
        throw new Error("Reset failed");
      }

      setIsSuccess(true);

      // Auto redirect after a short delay
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError("Reset link is invalid or expired. Please request a new one.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#F4F4F4] min-h-screen w-full flex items-center justify-center p-4 lg:p-6 text-[#1F1F1F] font-sans">
      <div className="w-full h-full max-w-[1600px] flex gap-10 lg:gap-20 bg-white lg:bg-transparent rounded-[32px] lg:rounded-none shadow-xl lg:shadow-none overflow-hidden min-h-[600px]">
        {/* --- Left: Form --- */}
        <div className="w-full lg:w-5/12 flex flex-col justify-center px-4 md:px-12 lg:pl-16 lg:pr-0">
          <div className="w-full max-w-[450px] mx-auto lg:mx-0">
            {!isSuccess && (
              <>
                <h1 className="text-4xl font-bold mb-3 tracking-tight">
                  Reset Password
                </h1>
                <p className="text-gray-400 text-sm mb-8">
                  Enter your new password below.
                </p>

                {error && (
                  <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  {/* New Password */}
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-[52px] bg-transparent border border-gray-300 rounded px-4 text-sm outline-none focus:border-[#A3907B]"
                      placeholder="New password"
                    />
                  </div>

                  {/* Confirm Password */}
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-[52px] bg-transparent border border-gray-300 rounded px-4 text-sm outline-none focus:border-[#A3907B]"
                      placeholder="Confirm password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full h-[50px] bg-[#AD9C86] hover:bg-[#968672] text-white font-medium rounded text-sm transition shadow-sm ${
                      isLoading ? "opacity-80 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading ? "Resetting..." : "Reset Password"}
                  </button>
                </form>

                <div className="text-center mt-6">
                  <Link
                    to="/login"
                    className="text-sm text-gray-500 hover:text-black transition"
                  >
                    Back to Sign in
                  </Link>
                </div>
              </>
            )}

            {isSuccess && (
              <div className="text-center animate-fade-in-up">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-10 h-10 text-green-600"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold mb-2">Password updated</h2>
                <p className="text-gray-500 text-sm">Redirecting to sign in…</p>
              </div>
            )}
          </div>
        </div>

        {/* --- Right: Image --- */}
        <div className="hidden lg:block w-7/12 h-full relative">
          <img
            src={onlineImage}
            alt="Autumn background"
            className="w-full h-full object-cover rounded-[32px] shadow-sm brightness-[0.85]"
          />
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ResetPassword;

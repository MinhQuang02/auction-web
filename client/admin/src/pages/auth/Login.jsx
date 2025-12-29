import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { refetchUser } = useAuth();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      console.log(res);

      if (!res.ok) throw new Error("Invalid credentials");

      const data = await res.json();

      if (data.user.role !== "admin") {
        setError("Only admins can log in here");
        return;
      }

      localStorage.setItem("token", data.token);
      await refetchUser();
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  const onlineImage =
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop";

  return (
    <div className="bg-[#F4F4F4] min-h-screen w-full flex items-center justify-center p-4 lg:p-6 text-[#1F1F1F] font-sans">
      <div className="w-full h-full max-w-[1600px] flex gap-10 lg:gap-20 bg-white lg:bg-transparent rounded-[32px] lg:rounded-none shadow-xl lg:shadow-none overflow-hidden min-h-[600px]">
        {/* Left Side Image */}
        <div className="hidden lg:block w-7/12 h-auto relative">
          <img
            src={onlineImage}
            alt="Autumn Style"
            className="w-full h-full object-cover rounded-[32px] shadow-sm"
          />
        </div>

        {/* Right Side Form */}
        <div className="w-full lg:w-5/12 flex flex-col justify-center px-8 py-10 md:px-12 lg:pl-16 lg:pr-0">
          <div className="w-full max-w-[400px] mx-auto lg:mx-0">
            <h1 className="text-4xl font-bold mb-2 tracking-tight">
              Admin Sign In
            </h1>
            <p className="text-gray-400 text-sm mb-6">
              Please login with your admin account.
            </p>

            {error && <p className="text-red-600 mb-4">{error}</p>}

            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[52px] bg-transparent border border-[#8C7963] rounded px-4 text-sm outline-none text-black focus:ring-1 focus:ring-[#8C7963]"
                  placeholder="Email"
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[52px] bg-transparent border border-gray-300 rounded px-4 text-sm outline-none text-black focus:border-[#8C7963] placeholder-gray-400"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <button
                type="submit"
                className="w-full h-[50px] bg-[#AD9C86] hover:bg-[#968672] text-white font-medium rounded text-sm transition shadow-sm mt-2"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

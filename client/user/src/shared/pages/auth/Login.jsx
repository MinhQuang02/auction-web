import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const onlineImage =
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!form.email || !form.password) {
      setErrorMessage("Email and password are required.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid email or password.");
      }

      localStorage.setItem("token", data.token);
      navigate("/home");
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleGoogleSignIn = () => {
    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: async (response) => {
        try {
          const res = await fetch(`${API_URL}/api/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: response.credential }),
          });
          const data = await res.json();

          if (!res.ok) throw new Error(data.message || "Google sign-in failed");

          localStorage.setItem("token", data.token);
          navigate("/home");
        } catch (err) {
          setErrorMessage(err.message);
        }
      },
    });

    google.accounts.id.prompt(); // shows the popup
  };

  return (
    <div className="bg-[#F4F4F4] min-h-screen w-full flex items-center justify-center p-4 lg:p-6 text-[#1F1F1F] font-sans">
      <div className="w-full h-full max-w-[1600px] flex gap-10 lg:gap-20 bg-white lg:bg-transparent rounded-[32px] lg:rounded-none shadow-xl lg:shadow-none overflow-hidden min-h-[600px]">
        {/* Left Side - Image (Autumn Vibe) */}
        <div className="hidden lg:block w-7/12 h-auto relative">
          <img
            src={onlineImage}
            alt="Autumn Style"
            className="w-full h-full object-cover rounded-[32px] shadow-sm"
          />
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-5/12 flex flex-col justify-center px-8 py-10 md:px-12 lg:pl-16 lg:pr-0">
          <div className="w-full max-w-[400px] mx-auto lg:mx-0">
            <h1 className="text-4xl font-bold mb-2 tracking-tight">Sign in</h1>
            <p className="text-gray-400 text-sm mb-10">
              Please login to continue to your account.
            </p>

            <div className="mb-4 min-h-[48px]">
              {errorMessage && (
                <div className="rounded bg-red-100 text-red-800 px-4 py-2 text-sm">
                  {errorMessage}
                </div>
              )}
            </div>

            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              {/* Email Input */}
              <div className="relative">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value });
                    setErrorMessage("");
                  }}
                  className="w-full h-[52px] bg-transparent border border-[#8C7963] rounded px-4 text-sm outline-none text-black focus:ring-1 focus:ring-[#8C7963]"
                />
                <label className="absolute -top-2.5 left-3 bg-white lg:bg-[#F4F4F4] px-1 text-xs font-medium text-[#8C7963]">
                  Email
                </label>
              </div>

              {/* Password Input */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value });
                    setErrorMessage("");
                  }}
                  className="w-full h-[52px] bg-transparent border border-gray-300 rounded px-4 text-sm outline-none text-black focus:border-[#8C7963] placeholder-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.454 10.454 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228A10.454 10.454 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {/* Keep logged in + Forgot Password */}
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="keep-logged"
                    className="w-4 h-4 border-2 border-black rounded-sm bg-transparent accent-black cursor-pointer"
                  />
                  <label
                    htmlFor="keep-logged"
                    className="text-xs font-medium text-black cursor-pointer select-none"
                  >
                    Keep me logged in
                  </label>
                </div>

                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-[#AD9C86] hover:text-[#8E7C68] hover:underline transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full h-[50px] bg-[#AD9C86] hover:bg-[#968672] text-white font-medium rounded text-sm transition shadow-sm mt-2"
              >
                Sign in
              </button>

              <div className="flex items-center gap-4 my-1">
                <div className="h-px bg-gray-200 flex-grow"></div>
                <span className="text-gray-400 text-xs">or</span>
                <div className="h-px bg-gray-200 flex-grow"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full h-[50px] bg-[#E6E4E1] hover:bg-[#dcdad7] text-black font-medium rounded text-sm transition flex items-center justify-center gap-2"
              >
                <span>Sign in with Google</span>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              </button>

              <div className="text-center text-sm text-gray-500 mt-4">
                Need an account?{" "}
                <Link
                  to="/signup"
                  className="underline decoration-1 underline-offset-2 hover:text-black transition"
                >
                  Create one
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";

const API_URL = import.meta.env.VITE_API_URL;
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [captchaToken, setCaptchaToken] = useState(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    address: "",
    email: "",
    password: "",
    dob: "",
  });

  const onlineImage =
    "https://images.unsplash.com/photo-1476820865390-c52aeebb9891?q=80&w=2670&auto=format&fit=crop";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.dob
    ) {
      return "Please fill in all required fields.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      return "Invalid email address.";
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(form.password)) {
      return "Password must be at least 8 characters and include a number.";
    }

    const dobDate = new Date(form.dob);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dobDate >= today) {
      return "Date of birth must be in the past.";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    if (!captchaToken) {
      setErrorMessage("Please complete the reCAPTCHA.");
      return;
    }

    const payload = {
      full_name: `${form.firstName.trim()} ${form.lastName.trim()}`,
      address: form.address,
      email: form.email,
      password: form.password,
      dob: form.dob,
      captchaToken,
    };

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Signup failed");
      }

      setSuccessMessage("Signup successful. Please verify your email.");
      setTimeout(() => {
        navigate("/verify-email", {
          state: { email: form.email },
        });
      }, 1200);
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
          console.log(res);
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
        {/* Left Side - Image */}
        <div className="hidden lg:block w-7/12 h-auto relative">
          <img
            src={onlineImage}
            alt="Autumn Forest"
            className="w-full h-full object-cover rounded-[32px] shadow-sm brightness-90"
          />
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-5/12 flex flex-col justify-center md:px-12 lg:pl-16 lg:pr-0">
          <div className="w-full max-w-[450px] mx-auto lg:mx-0">
            <h1 className="text-4xl font-bold mb-2 tracking-tight">Sign up</h1>
            <p className="text-gray-400 text-sm mb-8">
              Sign up to enjoy the feature of Style.Loom
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

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              {/* First Name & Last Name */}
              <div className="flex gap-4">
                <div className="relative w-1/2">
                  <input
                    type="text"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    className="w-full h-[50px] bg-transparent border border-gray-300 rounded px-4 text-sm outline-none text-black focus:border-[#A3907B]"
                  />
                  <label className="absolute -top-2.5 left-3 bg-white lg:bg-[#F4F4F4] px-1 text-xs text-gray-400">
                    First Name
                  </label>
                </div>
                <div className="relative w-1/2">
                  <input
                    type="text"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    className="w-full h-[50px] bg-transparent border border-gray-300 rounded px-4 text-sm outline-none text-black focus:border-[#A3907B]"
                  />
                  <label className="absolute -top-2.5 left-3 bg-white lg:bg-[#F4F4F4] px-1 text-xs text-gray-400">
                    Last Name
                  </label>
                </div>
              </div>

              {/* Address */}
              <div className="relative">
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  className="w-full h-[50px] bg-transparent border border-gray-300 rounded px-4 text-sm outline-none text-black focus:border-[#A3907B]"
                />
                <label className="absolute -top-2.5 left-3 bg-white lg:bg-[#F4F4F4] px-1 text-xs text-gray-400">
                  Address
                </label>
              </div>

              {/* DOB */}
              <div className="relative">
                <input
                  type="date"
                  name="dob"
                  value={form.dob}
                  onChange={handleChange}
                  className="w-full h-[50px] bg-transparent border border-gray-300 rounded px-4 text-sm outline-none text-black focus:border-[#A3907B]"
                />
                <label className="absolute -top-2.5 left-3 bg-white lg:bg-[#F4F4F4] px-1 text-xs text-gray-400">
                  Date of Birth
                </label>
              </div>

              {/* Email */}
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full h-[50px] bg-transparent border border-gray-300 rounded px-4 text-sm outline-none text-black focus:border-[#A3907B]"
                />
                <label className="absolute -top-2.5 left-3 bg-white lg:bg-[#F4F4F4] px-1 text-xs text-gray-400">
                  Email
                </label>
              </div>

              {/* Password */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full h-[50px] bg-transparent border border-gray-300 rounded px-4 text-sm outline-none text-black focus:border-[#A3907B] placeholder-gray-400"
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
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.454 10.454 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
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
                <label className="absolute -top-2.5 left-3 bg-white lg:bg-[#F4F4F4] px-1 text-xs text-gray-400">
                  Password
                </label>
              </div>

              {/* recaptcha */}
              <div className="flex justify-center my-2">
                <ReCAPTCHA
                  sitekey={RECAPTCHA_SITE_KEY}
                  onChange={(token) => {
                    setCaptchaToken(token);
                    setErrorMessage("");
                  }}
                  onExpired={() => setCaptchaToken(null)}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full h-[50px] bg-[#AD9C86] hover:bg-[#968672] text-white font-medium rounded text-sm transition shadow-sm mt-2"
              >
                Sign up
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 my-1">
                <div className="h-px bg-gray-200 flex-grow"></div>
                <span className="text-gray-400 text-xs">or</span>
                <div className="h-px bg-gray-200 flex-grow"></div>
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full h-[50px] bg-[#E6E4E1] hover:bg-[#dcdad7] text-black font-medium rounded text-sm transition flex items-center justify-center gap-2"
              >
                <span>Continue with Google</span>
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

              {/* Sign In Link */}
              <div className="text-center text-sm text-gray-500 mt-4">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="underline decoration-1 underline-offset-2 hover:text-black transition"
                >
                  Sign in
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;

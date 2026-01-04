import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();
  // Steps: 1 = Email, 2 = Verify OTP & Reset
  const [step, setStep] = useState(1);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Data
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const onlineImage =
    "https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?q=80&w=2670&auto=format&fit=crop";

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Could not send OTP. Check email or try again later.");

      // Success Step 1
      setStep(2);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify & Reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp || !newPassword || !confirmPassword) {
      setError("Please fill all fields.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password: newPassword }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Reset failed. Invalid OTP or expired.");

      // Success
      setIsSuccess(true);
      setTimeout(() => navigate("/login"), 3000); // Auto redirect
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#F4F4F4] min-h-screen w-full flex items-center justify-center p-4 lg:p-6 text-[#1F1F1F] font-sans">
      <div className="w-full h-full max-w-[1600px] flex gap-10 lg:gap-20 bg-white lg:bg-transparent rounded-[32px] lg:rounded-none shadow-xl lg:shadow-none overflow-hidden min-h-[600px]">

        {/* --- Left Side: Content --- */}
        <div className="w-full lg:w-5/12 flex flex-col justify-center px-4 md:px-12 lg:pl-16 lg:pr-0">
          <div className="w-full max-w-[450px] mx-auto lg:mx-0">

            {/* ERROR ALERT */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {!isSuccess && step === 1 && (
              <div className="animate-fade-in-up">
                <h1 className="text-4xl font-bold mb-3 tracking-tight">Forgot Password?</h1>
                <p className="text-gray-400 text-sm mb-10 leading-relaxed">
                  Enter your email address to receive a secure OTP code.
                </p>

                <form onSubmit={handleRequestOtp} className="flex flex-col gap-6">
                  {/* Email Input */}
                  <div className="relative group">
                    <input
                      type="email"
                      id="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-[52px] bg-transparent border border-gray-300 rounded px-4 text-sm outline-none text-black focus:border-[#A3907B] peer transition-colors placeholder-transparent"
                      placeholder="Enter your email"
                    />
                    <label
                      htmlFor="email"
                      className="absolute left-3 -top-2.5 bg-white lg:bg-[#F4F4F4] px-1 text-xs text-gray-400 transition-all 
                                peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
                                peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[#A3907B]"
                    >
                      Email Address
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full h-[50px] bg-[#AD9C86] hover:bg-[#968672] text-white font-medium rounded text-sm transition shadow-sm flex items-center justify-center gap-2 ${isLoading ? "opacity-80 cursor-not-allowed" : ""
                      }`}
                  >
                    {isLoading ? "Sending OTP..." : "Sen OTP Code"}
                  </button>
                </form>
              </div>
            )}

            {!isSuccess && step === 2 && (
              <div className="animate-fade-in-up">
                <h1 className="text-4xl font-bold mb-3 tracking-tight">Reset Password</h1>
                <p className="text-gray-400 text-sm mb-2">
                  We sent a 6-digit code to <strong>{email}</strong>.
                </p>
                <button onClick={() => setStep(1)} className="text-xs text-[#AD9C86] underline hover:text-[#8e7f6d] mb-8">
                  Change email?
                </button>

                <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
                  {/* OTP Input */}
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Numbers only
                      className="w-full h-[52px] bg-transparent border border-gray-300 rounded px-4 text-lg tracking-[5px] outline-none text-black focus:border-[#A3907B] text-center font-bold"
                      placeholder="------"
                    />
                    <label className="absolute -top-6 left-0 text-xs font-bold text-gray-500 uppercase tracking-widest">
                      Enter OTP Code
                    </label>
                  </div>

                  <div className="h-px bg-gray-200 my-2 w-full"></div>

                  {/* New Password */}
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-[52px] bg-transparent border border-gray-300 rounded px-4 text-sm outline-none focus:border-[#A3907B]"
                    placeholder="New Password (min 6 chars)"
                  />

                  {/* Confirm Password */}
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-[52px] bg-transparent border border-gray-300 rounded px-4 text-sm outline-none focus:border-[#A3907B]"
                    placeholder="Confirm New Password"
                  />

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full h-[50px] bg-[#AD9C86] hover:bg-[#968672] text-white font-medium rounded text-sm transition shadow-sm mt-2 ${isLoading ? "opacity-80 cursor-not-allowed" : ""
                      }`}
                  >
                    {isLoading ? "Resetting..." : "Confirm Reset"}
                  </button>
                </form>
              </div>
            )}

            {isSuccess && (
              <div className="w-full text-center animate-fade-in-up">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-10 h-10 text-green-600"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold mb-2">Success!</h2>
                <p className="text-gray-500 text-sm mb-8">
                  Your password has been securely reset. redirecting you to login...
                </p>
                <Link
                  to="/login"
                  className="w-full inline-block py-3 bg-[#1f1f1f] text-white font-medium rounded text-sm transition shadow-sm hover:bg-black"
                >
                  Go to Login Now
                </Link>
              </div>
            )}

            {/* Back to Login Link (Visible only if not success) */}
            {!isSuccess && (
              <div className="text-center mt-6">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-500 hover:text-black transition flex items-center justify-center gap-2 group"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Back to Sign in
                </Link>
              </div>
            )}

          </div>
        </div>

        {/* --- Right Side: Image --- */}
        <div className="hidden lg:block w-7/12 h-full relative">
          <img
            src={onlineImage}
            alt="Foggy Autumn Forest"
            className="w-full h-full object-cover rounded-[32px] shadow-sm brightness-[0.85]"
          />
        </div>
      </div>

      {/* Inline Style for Animation */}
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

export default ForgotPassword;

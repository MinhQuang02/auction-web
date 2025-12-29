import React, { useState } from "react";
import { Link } from "react-router-dom";

const UpgradeRequest = () => {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  const onlineImage =
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=2070&auto=format&fit=crop";

  const handleSubmit = (e) => {
    e.preventDefault();

    // TODO: wire this to API
    const payload = {
      reason,
      details,
    };

    console.log("Upgrade request:", payload);
  };

  return (
    <div className="bg-[#F4F4F4] min-h-screen w-full flex items-center justify-center p-4 lg:p-6 text-[#1F1F1F] font-sans">
      <div className="w-full h-full max-w-[1600px] flex gap-10 lg:gap-20 bg-white lg:bg-transparent rounded-[32px] lg:rounded-none shadow-xl lg:shadow-none overflow-hidden min-h-[600px]">
        {/* Left Side – Image */}
        <div className="hidden lg:block w-7/12 h-screen relative">
          <img
            src={onlineImage}
            alt="Upgrade account"
            className="w-full h-full object-cover rounded-[32px] shadow-sm"
          />
        </div>

        {/* Right Side – Form */}
        <div className="w-full lg:w-5/12 flex flex-col justify-center px-8 py-10 md:px-12 lg:pl-16 lg:pr-0">
          <div className="w-full max-w-[420px] mx-auto lg:mx-0">
            <h1 className="text-4xl font-bold mb-2 tracking-tight">
              Request Account Upgrade
            </h1>
            <p className="text-gray-400 text-sm mb-10">
              Tell us why you want to upgrade your account. An admin will review
              your request.
            </p>

            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              {/* Reason */}
              <div className="relative">
                <textarea
                  required
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-transparent border border-gray-300 rounded px-4 py-3 text-sm outline-none text-black focus:border-[#8C7963] resize-none"
                />
                <label className="absolute -top-2.5 left-3 bg-white lg:bg-[#F4F4F4] px-1 text-xs font-medium text-[#8C7963]">
                  Reason for upgrade
                </label>
              </div>

              {/* Additional Details */}
              <div className="relative">
                <textarea
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="w-full bg-transparent border border-gray-300 rounded px-4 py-3 text-sm outline-none text-black focus:border-[#8C7963] resize-none"
                />
                <label className="absolute -top-2.5 left-3 bg-white lg:bg-[#F4F4F4] px-1 text-xs font-medium text-gray-400">
                  Additional details (optional)
                </label>
              </div>

              <button
                type="submit"
                className="w-full h-[50px] bg-[#AD9C86] hover:bg-[#968672] text-white font-medium rounded text-sm transition shadow-sm mt-2"
              >
                Submit request
              </button>

              <div className="text-center text-sm text-gray-500 mt-4">
                Changed your mind?{" "}
                <Link
                  to="/"
                  className="underline decoration-1 underline-offset-2 hover:text-black transition"
                >
                  Go back home
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradeRequest;

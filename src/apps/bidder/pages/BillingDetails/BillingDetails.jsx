import React, { useState } from "react";

import monitorImg from "@assets/images/_monitorImg.png";
import gamepadImg from "@assets/images/_gamepadImg.png";

const BillingDetails = () => {
  const [paymentMethod, setPaymentMethod] = useState("cod"); // 'bank' hoặc 'cod'

  const cartItems = [
    {
      id: 1,
      name: "IPS LCD Gaming Monitor",
      image: monitorImg,
      price: "$650",
    },
    {
      id: 2,
      name: "Havit HV-G92 Gamepad",
      image: gamepadImg,
      price: "$1100",
    },
  ];

  return (
    <section
      id="billing"
      className="container mx-auto px-4 md:px-10 lg:px-32 xl:px-40 py-16 font-poppins text-[#1f1f1f]"
    >
      {" "}
                 {/* Breadcrumbs */}
      <div className="text-sm mb-12 flex items-center gap-2 text-gray-500">
        <span className="text-gray-400">Account</span>{" "}
        <span className="text-gray-400">/</span>
        <span className="text-gray-400">Product</span>{" "}
        <span className="text-gray-400">/</span>
        <span className="text-gray-400">View Cart</span>{" "}
        <span className="text-gray-400">/</span>
        <span className="text-black font-medium">CheckOut</span>
      </div>
      <h1 className="text-3xl font-medium mb-10 tracking-wide">
        Billing Details
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
        {/* --- LEFT COLUMN: BILLING FORM --- */}
        <form className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">
              First Name<span className="text-[#db4444]">*</span>
            </label>
            <input
              type="text"
              className="w-full bg-[#F5F5F5] rounded h-[50px] px-4 outline-none text-sm text-black"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">Company Name</label>
            <input
              type="text"
              className="w-full bg-[#F5F5F5] rounded h-[50px] px-4 outline-none text-sm text-black"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">
              Street Address<span className="text-[#db4444]">*</span>
            </label>
            <input
              type="text"
              className="w-full bg-[#F5F5F5] rounded h-[50px] px-4 outline-none text-sm text-black"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">
              Apartment, floor, etc. (optional)
            </label>
            <input
              type="text"
              className="w-full bg-[#F5F5F5] rounded h-[50px] px-4 outline-none text-sm text-black"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">
              Town/City<span className="text-[#db4444]">*</span>
            </label>
            <input
              type="text"
              className="w-full bg-[#F5F5F5] rounded h-[50px] px-4 outline-none text-sm text-black"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">
              Phone Number<span className="text-[#db4444]">*</span>
            </label>
            <input
              type="text"
              className="w-full bg-[#F5F5F5] rounded h-[50px] px-4 outline-none text-sm text-black"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">
              Email Address<span className="text-[#db4444]">*</span>
            </label>
            <input
              type="email"
              className="w-full bg-[#F5F5F5] rounded h-[50px] px-4 outline-none text-sm text-black"
            />
          </div>

          <div className="flex items-center gap-3 mt-2">
            <input
              type="checkbox"
              id="save-info"
              className="accent-[#AE9B84] w-4 h-4 cursor-pointer"
            />
            <label
              htmlFor="save-info"
              className="text-sm cursor-pointer select-none"
            >
              Save this information for faster check-out next time
            </label>
          </div>
        </form>

        {/* --- RIGHT COLUMN: ORDER SUMMARY --- */}
        <div className="flex flex-col gap-8 pt-8 lg:pt-0">
          {/* Cart Items List */}
          {cartItems.map((item) => (
            <div key={item.id} className="flex gap-5 items-center">
              <div className="bg-[#F5F5F5] p-4 rounded w-[120px] h-[120px] flex items-center justify-center">
                <img
                  src={item.image}
                  alt={item.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-medium text-base">{item.name}</h3>
                <p className="text-xs text-gray-500">
                  by <span className="font-medium">***ang</span>
                </p>
                {/* Stars (Static display) */}
                <div className="flex text-[#FFAD33] text-xs my-1">
                  {[...Array(4)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-3 h-3 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="text-gray-400 ml-1">(150 Reviews)</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed max-w-xs">
                  PlayStation 5 Controller Skin High quality vinyl with air
                  channel adhesive...
                </p>
              </div>
            </div>
          ))}

          {/* Pricing Breakdown */}
          <div className="flex flex-col gap-4 text-sm border-b border-gray-300 pb-4">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>$1750</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
          </div>

          <div className="flex justify-between text-sm font-medium">
            <span>Total:</span>
            <span>$1750</span>
          </div>

          {/* Payment Options */}
          <div className="flex flex-col gap-4 mt-2">
            {/* Bank Option */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="payment"
                  id="bank"
                  className="accent-black w-4 h-4 cursor-pointer"
                  checked={paymentMethod === "bank"}
                  onChange={() => setPaymentMethod("bank")}
                />
                <label htmlFor="bank" className="text-sm cursor-pointer">
                  Bank
                </label>
              </div>
              <div className="flex gap-1">
                <span className="text-[10px] font-bold text-blue-600 px-1 bg-gray-100 rounded">
                  Visa
                </span>
                <span className="text-[10px] font-bold text-red-500 px-1 bg-gray-100 rounded">
                  MC
                </span>
              </div>
            </div>

            {/* COD Option */}
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="payment"
                id="cod"
                className="accent-black w-4 h-4 cursor-pointer"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
              />
              <label htmlFor="cod" className="text-sm cursor-pointer">
                Cash on delivery
              </label>
            </div>
          </div>

          {/* Coupon Input */}
          <div className="flex gap-4 mt-2">
            <input
              type="text"
              placeholder="Coupon Code"
              className="border border-black rounded px-4 py-3 text-sm outline-none w-full bg-transparent"
            />
            <button className="bg-[#AE9B84] text-white px-6 py-3 rounded text-sm hover:bg-[#968571] transition whitespace-nowrap">
              Apply Coupon
            </button>
          </div>

          {/* Place Order Button */}
          <button className="bg-[#AE9B84] text-white w-full py-4 rounded text-sm font-medium hover:bg-[#968571] transition mt-2">
            Place Order
          </button>
        </div>
      </div>
    </section>
  );
};

export default BillingDetails;

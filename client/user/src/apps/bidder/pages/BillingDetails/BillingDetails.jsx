import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "../../../../components/ui/Toast";

const API_URL = import.meta.env.VITE_API_URL;

const BillingDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const product = location.state?.product;

  const [paymentMethod, setPaymentMethod] = useState("cod"); // 'bank' or 'cod'
  const [formData, setFormData] = useState({
    firstName: "",
    companyName: "",
    address: "",
    apartment: "",
    city: "",
    phone: "",
    email: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!product) {
      addToast("No product selected for payment.", "error");
      navigate('/my-purchases');
    }
  }, [product, navigate]);

  if (!product) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation
    if (!formData.firstName || !formData.address || !formData.city || !formData.phone || !formData.email) {
      addToast("Please fill in all required fields.", "error");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/api/products/user/purchases/${product.product_id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          paymentMethod
        })
      });

      const data = await res.json();

      if (res.ok) {
        addToast("Payment Successful!", "success");
        navigate('/my-purchases');
      } else {
        addToast(data.message || "Payment failed", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("An error occurred during payment.", "error");
    } finally {
      setLoading(false);
    }
  };

  const price = Number(product.current_price);
  const imageUrl = product.main_image_url || product.images?.[0]?.image_url || "https://via.placeholder.com/150";

  return (
    <section
      id="billing"
      className="container mx-auto px-4 md:px-10 lg:px-32 xl:px-40 py-16 font-poppins text-[#1f1f1f]"
    >
      {/* Breadcrumbs */}
      <div className="text-sm mb-12 flex items-center gap-2 text-gray-500">
        <span className="text-gray-400">Account</span>{" "}
        <span className="text-gray-400">/</span>
        <span className="text-gray-400">My Purchases</span>{" "}
        <span className="text-gray-400">/</span>
        <span className="text-black font-medium">Checkout</span>
      </div>
      <h1 className="text-3xl font-medium mb-10 tracking-wide">
        Billing Details
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
        {/* --- LEFT COLUMN: BILLING FORM --- */}
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">
              First Name<span className="text-[#db4444]">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full bg-[#F5F5F5] rounded h-[50px] px-4 outline-none text-sm text-black"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">Company Name</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className="w-full bg-[#F5F5F5] rounded h-[50px] px-4 outline-none text-sm text-black"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">
              Street Address<span className="text-[#db4444]">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full bg-[#F5F5F5] rounded h-[50px] px-4 outline-none text-sm text-black"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">
              Apartment, floor, etc. (optional)
            </label>
            <input
              type="text"
              name="apartment"
              value={formData.apartment}
              onChange={handleChange}
              className="w-full bg-[#F5F5F5] rounded h-[50px] px-4 outline-none text-sm text-black"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">
              Town/City<span className="text-[#db4444]">*</span>
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full bg-[#F5F5F5] rounded h-[50px] px-4 outline-none text-sm text-black"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">
              Phone Number<span className="text-[#db4444]">*</span>
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-[#F5F5F5] rounded h-[50px] px-4 outline-none text-sm text-black"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">
              Email Address<span className="text-[#db4444]">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-[#F5F5F5] rounded h-[50px] px-4 outline-none text-sm text-black"
              required
            />
          </div>
        </form>

        {/* --- RIGHT COLUMN: ORDER SUMMARY --- */}
        <div className="flex flex-col gap-8 pt-8 lg:pt-0">
          {/* Cart Items List - Using Single Product */}
          <div className="flex gap-5 items-center">
            <div className="bg-[#F5F5F5] p-4 rounded w-[120px] h-[120px] flex items-center justify-center">
              <img
                src={imageUrl}
                alt={product.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="font-medium text-base">{product.name}</h3>
              <p className="text-xs text-gray-500">
                Seller: <span className="font-medium">{product.seller?.full_name || '***'}</span>
              </p>
              <p className="text-xs text-gray-600 leading-relaxed max-w-xs truncate">
                {product.description}
              </p>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="flex flex-col gap-4 text-sm border-b border-gray-300 pb-4">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${price}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
          </div>

          <div className="flex justify-between text-sm font-medium">
            <span>Total:</span>
            <span>${price}</span>
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

          {/* Place Order Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#AE9B84] text-white w-full py-4 rounded text-sm font-medium hover:bg-[#968571] transition mt-2 disabled:bg-gray-400"
          >
            {loading ? 'Processing...' : 'Place Order'}
          </button>
        </div>
      </div>
    </section>
  );
};

export default BillingDetails;

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import { useEffect, useRef, useState } from "react";
import logo from "@assets/images/_logo.svg";

const Header = () => {
  // FIX: Destructure 'user', NOT 'role'
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/home");
  };

  return (
    <header className="bg-[#F6F6F6] border-b border-gray-200 py-3 lg:py-5 sticky top-0 z-50">
      <div className="container mx-auto px-4 lg:px-12">
        <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-y-4">
          <Link
            to="/"
            className="order-1 lg:absolute lg:left-1/2 lg:top-[53%] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:order-2"
          >
            <img src={logo} alt="Style Loom Logo" className="h-6 lg:h-8" />
          </Link>

          <div className="flex items-center gap-2 lg:gap-4 order-2 lg:order-3 ml-auto lg:ml-0">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2.5 lg:py-3.5 bg-textDark text-white rounded-lg text-xs font-mono hover:bg-[#2b1b17]"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2.5 lg:py-3.5 bg-primary text-white rounded-lg text-xs font-mono hover:bg-[#543b32]"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setOpen((v) => !v)}
                  className="px-4 lg:px-6 min-h-[40px] lg:min-h-[46px] flex items-center gap-2 bg-primary text-white rounded-lg font-mono text-xs hover:bg-[#543b32] shrink-0"
                >
                  {/* FIX: Use user?.full_name to avoid crash if user is loading */}
                  <span className="max-w-[120px] truncate">
                    {user?.full_name || "User"}
                  </span>
                  <span className="text-[10px]">▾</span>
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-50">
                    <Link
                      to="/profile"
                      onClick={() => setOpen(false)}
                      className="block px-4 py-2 text-xs hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/wishlist"
                      onClick={() => setOpen(false)}
                      className="block px-4 py-2 text-xs hover:bg-gray-100"
                    >
                      Wishlist
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 order-3 w-full lg:w-auto lg:order-1 lg:flex-none">
            <Link
              to="/"
              className="flex-1 lg:flex-none text-center px-4 lg:px-5 py-2.5 lg:py-3.5 border border-dashed border-black rounded-lg font-mono text-xs text-textDark hover:bg-gray-100 transition"
            >
              Home
            </Link>

            {/* Seller Mode / Become a Seller Button */}
            <Link
              to={!isAuthenticated ? "/login" : (user?.role === "seller" ? "/seller/products" : "/upgrade")}
              className="flex-1 lg:flex-none text-center px-4 lg:px-5 py-2.5 lg:py-3.5 border border-textDark rounded-lg font-mono text-xs bg-textDark text-white hover:bg-[#2b1b17] transition"
            >
              {user?.role === "seller" ? "Seller Mode" : "Become a Seller"}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
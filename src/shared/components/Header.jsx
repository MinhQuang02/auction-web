import { Link } from "react-router-dom";
import logo from "@assets/images/_logo.svg";
import wishlistIcon from "@assets/images/_wishlist_icon.svg";

const Header = () => {
  return (
    <header className="bg-[#F6F6F6] border-b border-gray-200 py-3 lg:py-5 sticky top-0 z-50">
      <div className="container mx-auto px-4 lg:px-12">
        {/* Flex Container */}
        <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-y-4">
          <Link
            to="/"
            className="order-1 lg:absolute lg:left-1/2 lg:top-1/2 lg:transform lg:-translate-x-1/2 lg:-translate-y-1/2 lg:order-2"
          >
            <img src={logo} alt="Style Loom Logo" className="h-6 lg:h-8" />
          </Link>

          <div className="flex items-center gap-2 lg:gap-4 order-2 lg:order-3 ml-auto lg:ml-0">
            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="w-[40px] h-[40px] lg:w-[46px] lg:h-[46px] bg-[#1a1a1a] rounded-lg flex justify-center items-center hover:bg-[#2b1b17] transition shrink-0"
            >
              <img
                src={wishlistIcon}
                alt="Wishlist"
                className="w-5 h-5 lg:w-auto"
              />
            </Link>

            {/* Sign Up Button */}
            <Link
              to="/profile"
              className="px-4 lg:px-8 py-2.5 lg:py-3.5 bg-primary text-white rounded-lg font-mono text-xs font-medium hover:bg-[#543b32] transition whitespace-nowrap"
            >
              Sign Up
            </Link>
          </div>

          <div className="flex items-center gap-2 order-3 w-full lg:w-auto lg:order-1 lg:flex-none">
            {/* Home Button */}
            <Link
              to="/"
              className="flex-1 lg:flex-none text-center px-4 lg:px-5 py-2.5 lg:py-3.5 border border-dashed border-black rounded-lg font-mono text-xs text-textDark hover:bg-gray-100 transition [border-style:dashed] [border-width:2px] [border-dasharray:5_5]"
            >
              Home
            </Link>

            {/* Seller Mode Button */}
            <Link
              to="/seller-mode"
              className="flex-1 lg:flex-none text-center px-4 lg:px-5 py-2.5 lg:py-3.5 border border-textDark rounded-lg font-mono text-xs bg-textDark text-white hover:bg-[#2b1b17] transition"
            >
              Seller Mode
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

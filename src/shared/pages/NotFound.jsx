import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <section
      id="404"
      className="container mx-auto px-4 md:px-10 lg:px-32 xl:px-40 py-16 font-poppins text-[#1f1f1f]"
    >
      <div className="text-sm mb-10 md:mb-20 flex items-center gap-2 text-gray-500">
        <Link to="/" className="hover:text-black transition">
          Home
        </Link>
        <span className="text-gray-400">/</span>
        <span className="text-black font-medium">404 Error</span>
      </div>

      {/* Content */}
      <div className="flex flex-col items-center justify-center py-10 md:py-20 text-center">
        <h1 className="text-6xl md:text-[110px] font-medium tracking-wider mb-6 md:mb-10 leading-none font-inter">
          404 Not Found
        </h1>

        <p className="text-sm md:text-base text-black mb-12 md:mb-20">
          Your visited page not found. You may go home page.
        </p>

        {/* Button Back to Home */}
        <Link
          to="/"
          className="bg-[#AE9B84] hover:bg-[#968571] text-white px-12 py-4 rounded-[4px] font-medium transition shadow-sm text-sm md:text-base"
        >
          Back to home page
        </Link>
      </div>
    </section>
  );
};

export default NotFound;

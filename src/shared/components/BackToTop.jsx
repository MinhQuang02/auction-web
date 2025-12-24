import React, { useState, useEffect } from "react";
import upArrow from "@assets/images/_upArrow.svg";

const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const buttonClasses = `
        fixed bottom-8 right-8 z-50 bg-gray-100 p-3 rounded-full shadow-lg 
        hover:bg-gray-200 transition-all duration-300 cursor-pointer
        ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}
        ${isVisible ? "" : "hidden"} 
    `;

  return (
    <button
      id="backToTop"
      className={buttonClasses}
      onClick={scrollToTop}
      style={{ display: isVisible || window.scrollY > 300 ? "flex" : "none" }}
    >
      <img src={upArrow} alt="Up" className="w-6 h-6" />
    </button>
  );
};

export default BackToTopButton;

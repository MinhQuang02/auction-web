import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

// Import Navigation Icons (Using defaults or assets from previous code)
import prevIcon from "@assets/images/_prevIcon.svg";
import nextIcon from "@assets/images/_nextIcon.svg";

// Fallback icon if url_icon is missing (using a generic SVG)
const DefaultIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-10 h-10 group-hover:invert group-hover:brightness-0 transition-all"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
    />
  </svg>
);

const API_URL = import.meta.env.VITE_API_URL;

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/api/categories/subcategory`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };

    fetchSubCategories();
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = direction === "left" ? -clientWidth / 2 : clientWidth / 2;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Only render if we have categories
  if (categories.length === 0) return null;

  return (
    <section id="categories" className="container mx-auto px-5 lg:px-12 py-10">
      {/* Header Section */}
      <div className="flex justify-between items-end mb-14">
        <div>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-5 h-10 bg-primary rounded"></div>
            <span className="text-primary font-semibold">Categories</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-wide">
            Browse By Category
          </h2>
        </div>

        {/* Navigation Arrows */}
        <div className="flex gap-2">
          <div
            onClick={() => scroll("left")}
            className="bg-gray-100 p-3 rounded-full cursor-pointer hover:bg-gray-200 transition select-none"
          >
            <img src={prevIcon} alt="Prev" />
          </div>
          <div
            onClick={() => scroll("right")}
            className="bg-gray-100 p-3 rounded-full cursor-pointer hover:bg-gray-200 transition select-none"
          >
            <img src={nextIcon} alt="Next" />
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div
        ref={scrollRef}
        className="flex gap-8 overflow-x-auto pb-6 scrollbar-hide snap-x scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((item) => {
          const inactiveClasses =
            "border border-gray-300 hover:bg-primary hover:text-white hover:shadow-lg";

          return (
            <Link
              to={`/category/${item.category_id}`} // Link to product list filtered by this category
              key={item.category_id}
              className={`flex-none w-[170px] snap-center rounded h-[145px] flex flex-col items-center justify-center gap-4 cursor-pointer group transition-all duration-300 ${inactiveClasses}`}
            >
              <div className="w-14 h-14 flex items-center justify-center">
                {item.url_icon ? (
                  <img
                    src={item.url_icon}
                    alt={item.name}
                    className="w-10 h-10 object-contain group-hover:invert group-hover:brightness-0 transition-all"
                  />
                ) : (
                  <DefaultIcon />
                )}
              </div>
              <span className="font-poppins text-center px-2 truncate w-full">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default Categories;

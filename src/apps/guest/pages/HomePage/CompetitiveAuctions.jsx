import { Link } from "react-router-dom";

import decorativeBg from "@assets/images/_decorativeBg.svg";
import arrowIcon from "@assets/images/_arrowIcon.svg";

import dress1 from "@assets/images/_dress1.png";
import dress2 from "@assets/images/_dress2.png";
import handbag from "@assets/images/_handbag.png";
import sunHat from "@assets/images/_sunHat.png";
import scarf from "@assets/images/_scarf.png";

const CompetitiveAuctions = () => {
  const products = [
    {
      id: 1,
      title: "Timeless A-line Evening Dress (16)",
      image: dress1,
      price: "$19.99",
      author: "***minh",
      dateRange: "Apr 1, 2025 -- Jun 5, 2025",
    },
    {
      id: 2,
      title: "Floral Bloom Maxi Dress (4)",
      image: dress2,
      price: "$19.99",
      author: "***minh",
      dateRange: "Apr 1, 2025 -- Jun 5, 2025",
    },
    {
      id: 3,
      title: "Urban Chic Handbag (23)",
      image: handbag,
      price: "$19.99",
      author: "***minh",
      dateRange: "Apr 1, 2025 -- Jun 5, 2025",
    },
    {
      id: 4,
      title: "Sophisticate Sun Hat (45)",
      image: sunHat,
      price: "$19.99",
      author: "***minh",
      dateRange: "Apr 1, 2025 -- Jun 5, 2025",
    },
    {
      id: 5,
      title: "Boho Chic Printed Scarf (16)",
      image: scarf,
      price: "$19.99",
      author: "***minh",
      dateRange: "Apr 1, 2025 -- Jun 5, 2025",
    },
  ];

  return (
    <section
      id="competitive-auctions"
      className="py-10 relative w-full overflow-hidden"
    >
      <div className="container mx-auto px-5 lg:px-12 relative">
        {/* Decorative Element */}
        <img
          src={decorativeBg}
          alt="Decorative element"
          className="absolute -top-0.5 -right-12 rotate-[20.36deg] z-0 hidden lg:block pointer-events-none"
        />

        {/* Header Section */}
        <div className="mb-14 relative z-10">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-5 h-10 bg-primary rounded"></div>
            <span className="text-primary font-semibold">Our Products</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-wide">
            Top 5 Competitive Auctions
          </h2>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 relative z-10">
          {products.map((product, index) => {
            const isLargeItem = index < 2;

            const colSpanClass = isLargeItem
              ? "lg:col-span-3"
              : "lg:col-span-2";
            const imageHeightClass = isLargeItem ? "h-[350px]" : "h-[291px]";
            const titleSizeClass = isLargeItem ? "text-xl" : "text-lg";

            return (
              <div
                key={product.id}
                className={`${colSpanClass} bg-secondary shadow-lg p-5 flex flex-col gap-4 rounded-b-lg group hover:shadow-xl transition-all`}
              >
                {/* Product Image */}
                <img
                  src={product.image}
                  alt={product.title}
                  className={`w-full ${imageHeightClass} object-cover rounded-t-3xl`}
                />

                {/* Date & Action Button */}
                <div className="flex justify-between items-center">
                  <div className="bg-[#1a1a1a] text-[#b3b3b2] text-xs px-3 py-2 rounded-full">
                    {product.dateRange}
                  </div>
                  <Link
                    to="/product"
                    className="bg-[#1f1f1f] border border-[#404040] text-[#d1d1d6] text-sm px-5 py-3.5 rounded-lg flex items-center gap-1 hover:bg-black transition"
                  >
                    <span>Bid Now</span>
                    <img src={arrowIcon} alt="arrow" />
                  </Link>
                </div>

                {/* Title */}
                <h3 className={`font-medium ${titleSizeClass}`}>
                  {product.title}
                </h3>

                {/* Price & Author */}
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-textGray">Price</span>
                  <span className="w-1 h-1 bg-[#ccc] rounded-full"></span>
                  <span className="font-medium text-textDark">
                    {product.price}
                  </span>

                  <span className="text-textGray">By</span>
                  <span className="w-1 h-1 bg-[#ccc] rounded-full"></span>
                  <span className="font-medium text-textDark">
                    {product.author}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CompetitiveAuctions;

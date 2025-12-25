import { Link } from "react-router-dom";

// Import Icons
import arrowLeft from "@assets/images/_arrowLeft.svg";
import arrowRight from "@assets/images/_arrowRight.svg";
import wishIcon from "@assets/images/_wishIcon.svg";
import viewIcon from "@assets/images/_viewIcon.svg";

// Import Product Images
import gamepadImg from "@assets/images/_gamepadImg.png";
import keyboardImg from "@assets/images/_keyboardImg.png";
import monitorImg from "@assets/images/_monitorImg.png";
import chairImg from "@assets/images/_chairImg.png";

const RelatedItems = () => {
  const products = [
    {
      id: 1,
      image: gamepadImg,
      priceTag: "240$",
      title: "HAVIT HV-G92 Gamepad (88)",
      currentPrice: "$120",
      bidder: "***hoa",
      dateRange: "Apr 1, 2025 -- Jun 5, 2025",
    },
    {
      id: 2,
      image: keyboardImg,
      priceTag: "2400$",
      title: "AK-900 Wired Keyboard (75)",
      currentPrice: "$960",
      bidder: "***yen",
      dateRange: "Apr 1, 2025 -- Jun 5, 2025",
    },
    {
      id: 3,
      image: monitorImg,
      priceTag: "406$",
      title: "IPS LCD Gaming Monitor (16)",
      currentPrice: "$370",
      bidder: "***inh",
      dateRange: "Apr 1, 2025 -- Jun 5, 2025",
    },
    {
      id: 4,
      image: chairImg,
      priceTag: "518$",
      title: "S-Series Comfort Chair (23)",
      currentPrice: "$375",
      bidder: "***inh",
      dateRange: "Apr 1, 2025 -- Jun 5, 2025",
    },
    {
      id: 5,
      image: gamepadImg,
      priceTag: "260$",
      title: "HAVIT HV-G92 Gamepad Pro (12)",
      currentPrice: "$150",
      bidder: "***tam",
      dateRange: "Jul 1, 2025 -- Aug 5, 2025",
    },
    {
      id: 6,
      image: keyboardImg,
      priceTag: "2500$",
      title: "AK-900 Mechanical Keyboard (99)",
      currentPrice: "$1100",
      bidder: "***kieu",
      dateRange: "Aug 10, 2025 -- Sep 15, 2025",
    },
    {
      id: 7,
      image: monitorImg,
      priceTag: "450$",
      title: "IPS LCD 4K Monitor (5)",
      currentPrice: "$400",
      bidder: "***hung",
      dateRange: "Sep 5, 2025 -- Oct 1, 2025",
    },
    {
      id: 8,
      image: chairImg,
      priceTag: "600$",
      title: "Ergo Office Chair (42)",
      currentPrice: "$450",
      bidder: "***lan",
      dateRange: "Oct 10, 2025 -- Nov 10, 2025",
    },
  ];

  return (
    <section
      id="related-items"
      className="container mx-auto px-5 lg:px-12 py-10"
    >
      {/* Header Section */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-5 h-10 bg-primary rounded"></div>
            <span className="text-primary font-semibold">Our Products</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-wide">
            Related Items
          </h2>
        </div>

        {/* Navigation Arrows */}
        <div className="flex gap-2">
          <button className="bg-gray-100 p-3 rounded-full cursor-pointer hover:bg-gray-200 transition">
            <img src={arrowLeft} alt="Prev" className="w-6 h-6" />
          </button>
          <button className="bg-gray-100 p-3 rounded-full cursor-pointer hover:bg-gray-200 transition">
            <img src={arrowRight} alt="Next" className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Scrollable Product List */}
      <div className="flex gap-8 overflow-x-auto pb-6 scrollbar-hide snap-x">
        {products.map((product) => (
          <div key={product.id} className="flex-none w-[270px] snap-center">
            {/* Image Card */}
            <div className="relative bg-secondary rounded-md shadow-md h-[250px] flex justify-center items-center overflow-hidden mb-4 group">
              <img
                src={product.image}
                alt={product.title}
                className="max-h-[180px] object-contain p-4"
              />

              {/* Price Tag */}
              <div className="absolute top-3 left-3 bg-primary text-white text-xs px-3 py-1 rounded">
                {product.priceTag}
              </div>

              {/* Action Buttons (Wishlist / View) */}
              <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button className="w-[34px] h-[34px] rounded-full bg-white flex items-center justify-center shadow hover:bg-gray-100 transition">
                  <img src={wishIcon} alt="Wish" />
                </button>
                <button className="w-[34px] h-[34px] rounded-full bg-white flex items-center justify-center shadow hover:bg-gray-100 transition">
                  <img src={viewIcon} alt="View" />
                </button>
              </div>

              {/* Bid Now Button Overlay */}
              <Link
                to="/product"
                className="absolute bottom-0 w-full bg-black text-white text-center py-2 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                Bid Now
              </Link>
            </div>

            {/* Product Info */}
            <h3
              className="font-medium text-base mb-2 truncate"
              title={product.title}
            >
              {product.title}
            </h3>
            <div className="flex gap-3 items-center mb-2">
              <span className="text-primary font-medium">
                {product.currentPrice}
              </span>
              <span className="text-gray-500 opacity-50 font-medium">
                by {product.bidder}
              </span>
            </div>
            <div className="bg-gray-200/50 rounded-full px-2 py-0.5 text-xs inline-block text-gray-600">
              {product.dateRange}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default RelatedItems;

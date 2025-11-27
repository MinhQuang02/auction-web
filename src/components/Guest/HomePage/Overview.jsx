import heroBanner from '../../../assets/images/f8095e6d55a76e6cff424c50ed846cf8bb2e8423.png';
import fiveStars from '../../../assets/images/3_1722.svg';

const Overview = () => {
    return (
        <div className="flex-grow bg-[#f2f2f2] rounded-2xl shadow-lg overflow-hidden flex flex-col font-sans text-[#1f1f1f]">
            
            {/* Hero Banner with Navigation Buttons and Bid Now */}
            <div className="relative group">
                <img src={heroBanner} alt="Hero Banner" className="w-full h-[250px] object-cover" />
                
                {/* Left Navigation Button */}
                <button className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition cursor-pointer text-gray-800 z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>

                {/* Right Navigation Button */}
                <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition cursor-pointer text-gray-800 z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>

                {/* Bid Now Button */}
                <a href="./product.html" className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-20 bg-[#1f1f1f] text-white rounded-[4px] px-6 py-3 flex items-center gap-2 text-xs hover:bg-black transition shadow-lg border border-[#333]">
                    <span>Bid Now</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                    </svg>
                </a>
            </div>

            {/* Product Details Section */}
            <div className="flex flex-col md:flex-row pt-8 w-full h-full"> 
                
                {/* Product Information */}
                <div className="w-full md:w-1/2 p-8 pr-6 border-b-2 md:border-b-0 md:border-r-2 border-dashed border-[#ccc] flex flex-col justify-center">
                    
                    {/* Category Buttons */}
                    <div className="flex gap-2.5 mb-4">
                        <button className="border border-dashed border-gray-400 rounded-lg px-4 py-2 bg-transparent font-mono text-[10px] text-gray-600 hover:border-gray-800 transition">All</button>
                        <button className="border border-dashed border-gray-400 rounded-lg px-4 py-2 bg-transparent font-mono text-[10px] text-gray-600 hover:border-gray-800 transition">Mens</button>
                        <button className="border border-dashed border-gray-400 rounded-lg px-4 py-2 bg-transparent font-mono text-[10px] text-gray-600 hover:border-gray-800 transition">Womens</button>
                    </div>
                    
                    <h2 className="font-bold text-2xl mb-1 uppercase tracking-tight">HAVIT HV-G92 GAMEPAD</h2>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-1">
                        <img src={fiveStars} alt="5 stars" className="h-3" />
                        <span className="text-sm font-semibold opacity-50">(88)</span>
                    </div>

                    <p className="text-[10px] font-semibold mb-6">by ***inh</p>
                    
                    <p className="text-[11px] leading-relaxed text-gray-600">
                        PlayStation 5 Controller Skin High quality vinyl with air channel adhesive for easy bubble free install & mess free removal Pressure sensitive.
                    </p>
                </div>

                {/* Bid Information */}
                <div className="w-full md:w-1/2 grid grid-cols-2 h-full">
                    
                    {/* Leading Bid Price */}
                    <div className="p-6 flex flex-col items-center justify-center text-center border-b-2 border-r-2 border-dashed border-[#ccc]">
                        <span className="font-medium text-2xl mb-1">50.00$</span>
                        <span className="text-[10px] text-gray-500">Leading Bid Price</span>
                    </div>

                    {/* Leading Bidder */}
                    <div className="p-6 flex flex-col items-center justify-center text-center border-b-2 border-dashed border-[#ccc]">
                        <span className="font-medium text-2xl mb-1">by ***kha</span>
                        <span className="text-[10px] text-gray-500">Leading Bidder</span>
                    </div>

                    {/* Time Remaining */}
                    <div className="p-6 flex flex-col items-center justify-center text-center border-r-2 border-dashed border-[#ccc]">
                        <span className="font-medium text-2xl mb-1">5 days, 3h</span>
                        <span className="text-[10px] text-gray-500">Time Remaining</span>
                    </div>

                    {/* Buy It Now Price */}
                    <div className="p-6 flex flex-col items-center justify-center text-center">
                        <span className="font-medium text-2xl mb-1">100.50$</span>
                        <span className="text-[10px] text-gray-500">Buy It Now</span>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Overview;
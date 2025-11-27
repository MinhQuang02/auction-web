import React, { useState } from 'react';

import mainProductImg from '../../../assets/images/_gamepadImg.png';

const Product = () => {
    const [bidAmount, setBidAmount] = useState(150);

    const renderStars = (filledCount = 4) => {
        return (
            <div className="flex text-[#FFAD33] text-sm">
                {[...Array(5)].map((_, index) => (
                    <svg 
                        key={index} 
                        className={`w-4 h-4 fill-current ${index < filledCount ? '' : 'text-gray-300'}`} 
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                ))}
            </div>
        );
    };

    return (
        <div className="flex-grow bg-white p-0 font-sans text-[#1f1f1f]">       
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm mb-6 text-gray-500">
                <span>Account</span> <span className="text-gray-400">/</span>
                <span>Gaming</span> <span className="text-gray-400">/</span>
                <span className="text-black font-medium">Havic HV G-92 Gamepad</span>
            </div>

            {/* Main Layout: Grid 2 Columns on Large Screens */}
            <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-8 h-auto xl:h-[480px]">
                
                {/* --- Left Column: Image Gallery --- */}
                <div className="flex flex-col-reverse md:flex-row gap-4 h-full w-full">                  
                    {/* Thumbnails List */}
                    <div className="flex md:flex-col gap-4 justify-between w-full md:w-[110px] flex-none h-auto md:h-full overflow-x-auto md:overflow-hidden">
                        {[0, 1, 2, 3].map((item, index) => {
                            // Tạo các biến thể xoay ảnh giả lập thumbnail khác nhau
                            let transformClass = "";
                            if (index === 1) transformClass = "-scale-x-100";
                            if (index === 2) transformClass = "rotate-45";
                            if (index === 3) transformClass = "-rotate-45";

                            return (
                                <div key={index} className="bg-[#F2F2F2] rounded-xl shadow-sm h-[80px] w-[80px] md:h-[110px] md:w-full flex-none flex items-center justify-center cursor-pointer border border-transparent hover:border-black transition p-2">
                                    <img src={mainProductImg} className={`w-14 h-auto object-contain ${transformClass}`} alt={`Thumb ${index + 1}`} />
                                </div>
                            );
                        })}
                    </div>

                    {/* Main Image Display */}
                    <div className="bg-[#F2F2F2] rounded-2xl shadow-lg flex-grow flex items-center justify-center p-8 w-full h-[300px] md:h-full">
                        <img src={mainProductImg} className="w-auto h-auto max-h-[240px] max-w-full object-contain drop-shadow-2xl" alt="Main Product" />
                    </div>
                </div>

                {/* --- Right Column: Product Info & Actions --- */}
                <div className="flex flex-col h-full justify-between py-1">
                    <div>
                        <h1 className="text-2xl font-bold mb-3 leading-tight">Havic HV G-92 Gamepad</h1>
                        
                        {/* Rating & Stock Status */}
                        <div className="flex items-center gap-2 mb-3">
                            {renderStars(4)}
                            <span className="text-gray-500 text-sm">(150 Reviews)</span>
                            <span className="text-gray-300">|</span>
                            <span className="text-[#00FF66] text-sm font-medium">In Stock</span>
                        </div>

                        {/* Price Info */}
                        <div className="flex items-baseline gap-3 mb-3">
                            <span className="text-2xl font-semibold">$192.00</span>
                            <span className="text-xs text-gray-500">Buy Now Price</span>
                        </div>

                        {/* Auction Times */}
                        <div className="text-sm text-gray-700 space-y-1 mb-3">
                            <p>• Auction Start Time: <span className="font-medium">17/02/2025</span></p>
                            <p>• Auction End Time: <span className="font-medium">19/07/2025</span></p>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-600 leading-snug mb-4 border-b pb-4 border-gray-300">
                            PlayStation 5 Controller Skin High quality vinyl with air channel adhesive for easy bubble free install & mess free removal Pressure sensitive.
                        </p>

                        {/* Highest Bid Info */}
                        <div className="mb-4">
                            <h3 className="text-lg font-medium mb-1">Highest Price: $170.20</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>by ***han</span>
                                <span className="text-gray-300">|</span>
                                <div className="flex text-[#FFAD33] text-xs">
                                    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                                </div>
                                <span>(170)</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons Container */}
                    <div className="w-full">
                        {/* Bidding Control Row */}
                        <div className="flex items-center gap-2 mb-4 w-full">
                            {/* Quantity/Price Adjuster */}
                            <div className="flex items-center border border-gray-400 rounded h-[44px] flex-none">
                                <button 
                                    onClick={() => setBidAmount(prev => Math.max(0, prev - 10))}
                                    className="px-3 py-1 text-xl text-gray-600 hover:bg-gray-100 h-full border-r border-gray-400 flex items-center"
                                >
                                    -
                                </button>
                                <input 
                                    type="text" 
                                    value={`${bidAmount}$`} 
                                    readOnly
                                    className="w-[60px] text-center font-bold focus:outline-none h-full text-lg bg-transparent"
                                />
                                <button 
                                    onClick={() => setBidAmount(prev => prev + 10)}
                                    className="px-3 py-1 text-xl text-gray-600 hover:bg-gray-100 h-full border-l border-gray-400 flex items-center"
                                >
                                    +
                                </button>
                            </div>

                            {/* Bid Now Button */}
                            <button className="bg-[#AE9B84] hover:bg-[#9c8a74] text-white px-4 h-[44px] rounded font-medium transition flex-1 whitespace-nowrap text-sm">
                                Bid Now
                            </button>
                            
                            {/* Wishlist Button */}
                            <button className="border border-gray-400 rounded h-[44px] w-[44px] flex-none flex items-center justify-center hover:bg-gray-50 transition">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                </svg>
                            </button>
                        </div>

                        {/* Proxy Bidding Info Box */}
                        <div className="border border-gray-400 rounded p-4 flex items-center gap-4 w-full">
                            <div className="flex-none">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                </svg>
                            </div>
                            <div className="flex-grow">
                                <h4 className="font-medium text-base">Proxy Bidding</h4>
                                <p className="text-xs text-gray-500 mt-0.5">Auto bid at fair price. <a href="#" className="underline font-semibold text-black">Details</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Product;
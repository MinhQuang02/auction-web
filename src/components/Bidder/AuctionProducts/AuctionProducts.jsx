import keyboardImg from '../../../assets/images/_keyboardImg.png';

const AuctionProducts = () => {
    const products = Array(8).fill({
        id: 1,
        title: 'AK-900 Wired Keyboard (75)',
        image: keyboardImg,
        priceTag: '2400$',
        currentPrice: '$960',
        author: '***yen',
        dateRange: 'Apr 1, 2025 - Jun 5, 2025',
    }).map((item, index) => ({ ...item, id: index + 1 }));

    return (
        <section id="auction-products" className="container mx-auto px-4 md:px-10 lg:px-32 xl:px-40 py-16 font-poppins text-[#1f1f1f]">    
            <div className="flex-grow w-full">      
                
                {/* --- Control Bar: Title, Search, View Toggle --- */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <h2 className="text-xl font-medium text-black">Auction Products ({products.length})</h2>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {/* Search Input */}
                        <div className="relative flex-grow md:flex-grow-0">
                            <input 
                                type="text" 
                                placeholder="Search product" 
                                className="bg-[#F5F5F5] rounded pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 w-full md:w-[300px] placeholder-gray-400"
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                        </div>

                        {/* View Toggle Buttons */}
                        <button className="p-2.5 rounded hover:bg-gray-100 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-gray-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        </button>
                        <button className="p-2.5 rounded bg-[#EAEAEA] hover:bg-gray-200 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-black">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* --- Product Grid --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">           
                    {products.map((product) => (
                        <div key={product.id} className="group flex flex-col gap-3">
                            {/* Image Container */}
                            <div className="relative bg-[#F5F5F5] rounded h-[250px] flex items-center justify-center overflow-hidden">
                                {/* Price Badge */}
                                <span className="absolute top-3 left-3 bg-[#AE9B84] text-white text-xs px-3 py-1 rounded shadow-sm">
                                    {product.priceTag}
                                </span>
                                
                                {/* Wishlist Button (Heart Icon) */}
                                <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow hover:bg-gray-100 transition">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                    </svg>
                                </button>

                                {/* Product Image */}
                                <img src={product.image} alt={product.title} className="w-[160px] object-contain drop-shadow-lg" />
                                
                                {/* Hover Action Button */}
                                <button className="absolute bottom-0 w-full bg-black text-white py-2 text-sm font-medium hover:bg-gray-800 transition md:opacity-0 md:group-hover:opacity-100 duration-300">
                                    View Details
                                </button>
                            </div>

                            {/* Product Info */}
                            <div>
                                <h3 className="font-bold text-base mb-1 truncate" title={product.title}>{product.title}</h3>
                                <div className="flex gap-2 text-sm mb-2">
                                    <span className="text-[#AE9B84] font-medium">{product.currentPrice}</span>
                                    <span className="text-gray-400">by {product.author}</span>
                                </div>
                                <div className="bg-gray-100 rounded-full px-3 py-1 text-[10px] text-gray-500 inline-block">
                                    {product.dateRange}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- Pagination --- */}
                <div className="flex justify-center gap-3 mt-12 text-sm text-gray-600 items-center">
                    <button className="flex items-center gap-1 hover:text-black transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Previous
                    </button>
                    
                    <div className="flex items-center gap-2">
                        <button className="w-8 h-8 bg-[#AE9B84] text-white rounded flex items-center justify-center">1</button>
                        <button className="w-8 h-8 hover:bg-gray-200 rounded flex items-center justify-center">2</button>
                        <button className="w-8 h-8 hover:bg-gray-200 rounded flex items-center justify-center">3</button>
                        <span className="w-8 h-8 flex items-center justify-center">...</span>
                        <button className="w-8 h-8 hover:bg-gray-200 rounded flex items-center justify-center">67</button>
                        <button className="w-8 h-8 hover:bg-gray-200 rounded flex items-center justify-center">68</button>
                    </div>

                    <button className="flex items-center gap-1 hover:text-black transition">
                        Next
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </button>
                </div>

            </div>
        </section>
    );
};

export default AuctionProducts;
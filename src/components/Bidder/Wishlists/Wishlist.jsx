import React from 'react';

// Import Product Image (Dùng chung cho demo)
import keyboardImg from '../../../assets/images/e59d9f348cc24eeff489863523b63971c3ff8e4a.png';

const Wishlist = () => {
    // Dữ liệu sản phẩm trong Wishlist
    const products = [
        {
            id: 1,
            title: 'AK-900 Wired Keyboard (75)',
            image: keyboardImg,
            priceTag: '2400$',
            price: '$960',
            author: '***yen',
            date: 'Apr 1, 2025 - Jun 5, 2025',
        },
        {
            id: 2,
            title: 'AK-900 Wired Keyboard (75)',
            image: keyboardImg,
            priceTag: '2400$',
            price: '$960',
            author: '***yen',
            date: 'Apr 1, 2025 - Jun 5, 2025',
        },
        {
            id: 3,
            title: 'AK-900 Wired Keyboard (75)',
            image: keyboardImg,
            priceTag: '2400$',
            price: '$960',
            author: '***yen',
            date: 'Apr 1, 2025 - Jun 5, 2025',
        },
        {
            id: 4,
            title: 'AK-900 Wired Keyboard (75)',
            image: keyboardImg,
            priceTag: '2400$',
            price: '$960',
            author: '***yen',
            date: 'Apr 1, 2025 - Jun 5, 2025',
        },
        {
            id: 5,
            title: 'AK-900 Wired Keyboard (75)',
            image: keyboardImg,
            priceTag: '2400$',
            price: '$960',
            author: '***yen',
            date: 'Apr 1, 2025 - Jun 5, 2025',
        },
        {
            id: 6,
            title: 'AK-900 Wired Keyboard (75)',
            image: keyboardImg,
            priceTag: '2400$',
            price: '$960',
            author: '***yen',
            date: 'Apr 1, 2025 - Jun 5, 2025',
        },
        {
            id: 7,
            title: 'AK-900 Wired Keyboard (75)',
            image: keyboardImg,
            priceTag: '2400$',
            price: '$960',
            author: '***yen',
            date: 'Apr 1, 2025 - Jun 5, 2025',
        },
        {
            id: 8,
            title: 'AK-900 Wired Keyboard (75)',
            image: keyboardImg,
            priceTag: '2400$',
            price: '$960',
            author: '***yen',
            date: 'Apr 1, 2025 - Jun 5, 2025',
        },
    ];

    return (
        <section id="wish-list" className="container mx-auto px-4 md:px-10 lg:px-32 xl:px-40 py-16 font-poppins text-[#1f1f1f]">    
            <div className="flex-grow w-full">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <h2 className="text-xl font-medium text-black">Wishlist ({products.length})</h2>
                    <button className="border border-gray-400 rounded px-8 py-3 bg-white text-sm font-medium hover:bg-gray-100 transition w-full md:w-auto">
                        Move All Out Wishlist
                    </button>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {products.map((product) => (
                        <div key={product.id} className="group flex flex-col gap-3">
                            {/* Image Container */}
                            <div className="relative bg-[#F5F5F5] rounded h-[250px] flex items-center justify-center overflow-hidden">
                                {/* Price Badge */}
                                <span className="absolute top-3 left-3 bg-[#AE9B84] text-white text-xs px-3 py-1 rounded shadow-sm">
                                    {product.priceTag}
                                </span>
                                
                                {/* Trash Icon (Remove from Wishlist) */}
                                <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow hover:bg-gray-100 transition">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>
                                </button>
                                
                                {/* Product Image */}
                                <img src={product.image} alt={product.title} className="w-[160px] object-contain drop-shadow-lg" />
                                
                                {/* View Details Overlay Button */}
                                <button className="absolute bottom-0 w-full bg-black text-white py-2 text-sm font-medium hover:bg-gray-800 transition">
                                    View Details
                                </button>
                            </div>

                            {/* Product Info */}
                            <div>
                                <h3 className="font-bold text-base mb-1 truncate" title={product.title}>{product.title}</h3>
                                <div className="flex gap-2 text-sm mb-2">
                                    <span className="text-[#AE9B84] font-medium">{product.price}</span>
                                    <span className="text-gray-400">by {product.author}</span>
                                </div>
                                <div className="bg-gray-100 rounded-full px-3 py-1 text-[10px] text-gray-500 inline-block">
                                    {product.date}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
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

export default Wishlist;
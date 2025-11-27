import wishIcon from '../../../assets/images/I3_1608_55_380.svg';
import viewIcon from '../../../assets/images/I3_1609_55_355_55_350.svg';

import keyboardImg from '../../../assets/images/e59d9f348cc24eeff489863523b63971c3ff8e4a.png';
import monitorImg from '../../../assets/images/5e634682db5174aff99bb9337d2dc9598a0b44e4.png';
import gamepadImg from '../../../assets/images/5d5c2e5250752d55f8b60f2aa2923183dadbc135.png';
import chairImg from '../../../assets/images/288da330273c46e1c3dc0a8915c4b031d0345347.png';

const ProductGrid = () => {
    const products = [
        {
            id: 1,
            title: 'AK-900 Wired Keyboard (88)',
            image: keyboardImg,
            priceTag: '2400$',
            price: '$960',
            author: '***yen',
            date: 'Apr 1, 2025 - Jun 5',
        },
        {
            id: 2,
            title: 'IPS LCD Gaming Monitor (12)',
            image: monitorImg,
            priceTag: '2400$',
            price: '$960',
            author: '***yen',
            date: 'Apr 1, 2025 - Jun 5',
        },
        {
            id: 3,
            title: 'HAVIT HV-G92 Gamepad (41)',
            image: gamepadImg,
            priceTag: '2400$',
            price: '$960',
            author: '***yen',
            date: 'Apr 1, 2025 - Jun 5',
        },
        {
            id: 4,
            title: 'AK-900 Wired Keyboard (12)',
            image: keyboardImg, // HTML gốc dùng lại ảnh keyboard
            priceTag: '2400$',
            price: '$960',
            author: '***yen',
            date: 'Apr 1, 2025 - Jun 5',
        },
        {
            id: 5,
            title: 'S-Series Comfort Chair (42)',
            image: chairImg,
            priceTag: '2400$',
            price: '$960',
            author: '***yen',
            date: 'Apr 1, 2025 - Jun 5',
        },
        {
            id: 6,
            title: 'AK-900 Wired Keyboard (66)',
            image: keyboardImg, // HTML gốc dùng lại ảnh keyboard
            priceTag: '2400$',
            price: '$960',
            author: '***yen',
            date: 'Apr 1, 2025 - Jun 5',
        },
        {
            id: 7,
            title: 'AK-900 Wired Keyboard (13)',
            image: keyboardImg, // HTML gốc dùng lại ảnh keyboard
            priceTag: '2400$',
            price: '$960',
            author: '***yen',
            date: 'Apr 1, 2025 - Jun 5',
        },
        {
            id: 8,
            title: 'AK-900 Wired Keyboard (13)',
            image: keyboardImg, // HTML gốc dùng lại ảnh keyboard
            priceTag: '2400$',
            price: '$960',
            author: '***yen',
            date: 'Apr 1, 2025 - Jun 5',
        },
    ];

    return (
        <div className="flex-grow bg-transparent p-0 flex flex-col font-sans text-[#1f1f1f] relative h-full">
            
            {/* --- Top Controls Section --- */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                {/* Breadcrumbs */}
                <div className="text-sm">
                    <span className="text-gray-400">Account /</span> <span className="font-medium text-black ml-1">Gaming</span>
                </div>
                
                {/* Controls: Sort, View, Pagination */}
                <div className="flex items-center gap-3">
                    {/* Sort Button */}
                    <div className="relative group">
                        <button className="bg-white border border-gray-300 rounded px-3 py-1.5 text-xs flex items-center gap-6 hover:bg-gray-50 transition">
                            <span>Sort by Price</span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3 h-3 text-gray-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                        </button>
                    </div>
                    
                    {/* View Mode Toggle (Grid/List) */}
                    <button className="bg-white border border-gray-300 rounded p-1.5 hover:bg-gray-50 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 text-black">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>

                    {/* Simple Pagination Arrows */}
                    <div className="flex gap-1 ml-2">
                        <button className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-black">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                        </button>
                        <button className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-black">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* --- Products Grid --- */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6">
                
                {products.map((product) => (
                    <div key={product.id} className="group flex flex-col gap-2">
                        {/* Image Container */}
                        <div className="relative bg-[#F5F5F5] rounded h-[150px] flex items-center justify-center overflow-hidden">
                            {/* Price Tag Badge */}
                            <span className="absolute top-2 left-2 bg-[#AE9B84] text-white text-[10px] px-2 py-0.5 rounded shadow-sm">
                                {product.priceTag}
                            </span>
                            
                            {/* Action Buttons */}
                            <div className="absolute top-2 right-2 flex flex-col gap-1.5">
                                <button className="bg-white rounded-full p-1 shadow hover:bg-gray-100 transition">
                                    <img src={wishIcon} alt="Wish" className="w-3 h-3" />
                                </button>
                                <button className="bg-white rounded-full p-1 shadow hover:bg-gray-100 transition">
                                    <img src={viewIcon} alt="View" className="w-3 h-3" />
                                </button>
                            </div>
                            
                            {/* Main Product Image */}
                            <img 
                                src={product.image} 
                                alt={product.title} 
                                className="max-h-[100px] w-auto object-contain drop-shadow-md" 
                            />
                            
                            {/* Hover Overlay Button */}
                            <button className="absolute bottom-0 w-full bg-black text-white py-1.5 text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-300">
                                View Details
                            </button>
                        </div>

                        {/* Product Info */}
                        <div>
                            <h3 className="font-bold text-sm mb-0.5 truncate" title={product.title}>
                                {product.title}
                            </h3>
                            <div className="flex gap-2 text-xs mb-1">
                                <span className="text-[#AE9B84] font-medium">{product.price}</span>
                                <span className="text-gray-400">by {product.author}</span>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-full px-2 py-0.5 text-[9px] text-gray-500 inline-block">
                                {product.date}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductGrid;
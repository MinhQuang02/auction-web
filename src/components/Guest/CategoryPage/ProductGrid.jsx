import { Link } from 'react-router-dom';

import wishIcon from '../../../assets/images/_wishIcon.svg';
import viewIcon from '../../../assets/images/_viewIcon.svg';

import keyboardImg from '../../../assets/images/_keyboardImg.png';
import monitorImg from '../../../assets/images/_monitorImg.png';
import gamepadImg from '../../../assets/images/_gamepadImg.png';
import chairImg from '../../../assets/images/_chairImg.png';

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
            image: keyboardImg,
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
            image: keyboardImg,
            priceTag: '2400$',
            price: '$960',
            author: '***yen',
            date: 'Apr 1, 2025 - Jun 5',
        },
        {
            id: 7,
            title: 'AK-900 Wired Keyboard (13)',
            image: keyboardImg,
            priceTag: '2400$',
            price: '$960',
            author: '***yen',
            date: 'Apr 1, 2025 - Jun 5',
        },
        {
            id: 8,
            title: 'AK-900 Wired Keyboard (13)',
            image: keyboardImg,
            priceTag: '2400$',
            price: '$960',
            author: '***yen',
            date: 'Apr 1, 2025 - Jun 5',
        },
    ];

    return (
        <div className="flex-grow bg-transparent p-0 flex flex-col font-sans text-[#1f1f1f] relative h-full">
            
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div className="text-sm">
                    <span className="text-gray-400">Account /</span> <span className="font-medium text-black ml-1">Gaming</span>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <button className="bg-white border border-gray-300 rounded px-3 py-1.5 text-xs flex items-center gap-6 hover:bg-gray-50 transition">
                            <span>Sort by Price</span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-3 h-3 text-gray-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                        </button>
                    </div>
                    
                    <button className="bg-white border border-gray-300 rounded p-1.5 hover:bg-gray-50 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 text-black">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                    </button>

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

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6">
                
                {products.map((product) => (
                    <div key={product.id} className="group flex flex-col gap-2">
                        <div className="relative bg-[#F5F5F5] rounded h-[150px] flex items-center justify-center overflow-hidden">
                            <span className="absolute top-2 left-2 bg-[#AE9B84] text-white text-[10px] px-2 py-0.5 rounded shadow-sm">
                                {product.priceTag}
                            </span>
                            
                            <div className="absolute top-2 right-2 flex flex-col gap-1.5">
                                <button className="bg-white rounded-full p-1 shadow hover:bg-gray-100 transition">
                                    <img src={wishIcon} alt="Wish" className="w-3 h-3" />
                                </button>
                                <button className="bg-white rounded-full p-1 shadow hover:bg-gray-100 transition">
                                    <img src={viewIcon} alt="View" className="w-3 h-3" />
                                </button>
                            </div>
                            
                            <img 
                                src={product.image} 
                                alt={product.title} 
                                className="max-h-[100px] w-auto object-contain drop-shadow-md" 
                            />
                            
                            <button className="absolute bottom-0 w-full bg-black text-white py-1.5 text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <Link to={`/product`}>View Details</Link>
                            </button>
                        </div>

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
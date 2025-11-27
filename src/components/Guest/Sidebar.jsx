import React from 'react';

const Sidebar = () => {
    const categories = [
        { name: 'Woman’s Fashion', href: './category.html' },
        { name: 'Men’s Fashion', href: './category.html' },
        { name: 'Electronics', href: './category.html' },
        { name: 'Home & Lifestyle', href: './category.html' },
        { name: 'Medicine', href: './category.html' },
        { name: 'Sports & Outdoor', href: './category.html' },
        { name: 'Baby’s & Toys', href: './category.html' },
        { name: 'Groceries & Pets', href: './category.html' },
        { name: 'Health & Beauty', href: './category.html' },
    ];

    return (
        <aside className="w-full lg:w-[276px] flex-none font-sans">
            <div className="rounded-2xl shadow-lg overflow-hidden flex flex-col h-full">
                
                {/* Search Bar Section */}
                <div className="bg-[#E4E4E4] p-6 pb-6">
                    <div className="bg-[#E9E1D7] bg-opacity-60 rounded-lg px-4 py-3 flex items-center justify-between border border-transparent focus-within:border-gray-400 transition shadow">
                        <input 
                            type="text" 
                            placeholder="What are you looking for?" 
                            className="bg-transparent border-none text-[13px] text-black w-full focus:outline-none placeholder-gray-700 font-medium" 
                        />
                        <button className="flex-none text-black hover:text-gray-600 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Category Navigation Section */}
                <div className="bg-[#F2F2F2] px-6 py-6 pb-10 flex-grow">
                    <nav>
                        <ul className="flex flex-col gap-5 text-[15px] text-[#1f1f1f]">
                            {categories.map((category) => (
                                <li key={category.name}>
                                    <a 
                                        href={category.href} 
                                        className="flex justify-between items-center group hover:font-semibold transition-all cursor-pointer"
                                    >
                                        <span>{category.name}</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4 text-black transition-transform">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                        </svg>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
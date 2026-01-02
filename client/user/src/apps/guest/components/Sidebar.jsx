import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const SidebarContent = ({ onItemClick, categories, expandedCategories, toggleCategory, searchTerm, setSearchTerm, handleSearch }) => (
    <div className="flex flex-col h-full bg-[#f2f2f2] text-[#1f1f1f] font-sans">
        {/* Search Bar Section */}
        <div className="bg-[#E4E4E4] p-5 shrink-0">
            <div className="bg-white rounded-lg px-4 py-2.5 flex items-center justify-between border border-transparent focus-within:border-[#AE9B84] transition shadow-sm">
                <input
                    type="text"
                    placeholder="What are you looking for?"
                    className="bg-transparent border-none text-[13px] text-black w-full focus:outline-none placeholder-gray-500 font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                    onClick={handleSearch}
                    className="flex-none text-[#AE9B84] hover:text-[#8e7d6a] transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                </button>
            </div>
        </div>

        {/* Category Navigation Section */}
        <div className="bg-[#f2f2f2] px-5 py-5 pb-8 flex-grow overflow-y-auto custom-scrollbar">
            <nav>
                <ul className="flex flex-col gap-3 text-[15px] text-[#1f1f1f]">
                    {categories.map((category) => {
                        const isExpanded = expandedCategories.includes(category.name);

                        return (
                            <li key={category.name} className="flex flex-col">
                                <button
                                    onClick={() => toggleCategory(category.name)}
                                    className={`flex justify-between items-center w-full group hover:text-[#AE9B84] transition-all cursor-pointer py-1 ${isExpanded ? 'text-[#AE9B84] font-medium' : ''}`}
                                >
                                    <span className="text-left group-hover:translate-x-1 transition-transform">{category.name}</span>

                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="2.5"
                                        stroke="currentColor"
                                        className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-90 text-[#AE9B84]' : 'text-gray-400'}`}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                    </svg>
                                </button>

                                <div className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                                    <ul className="flex flex-col gap-2 pl-4 border-l-2 border-[#E4E4E4] ml-1">
                                        {category.items.map((item, index) => (
                                            <li key={index}>
                                                <Link
                                                    to={item.to}
                                                    onClick={onItemClick}
                                                    className="block text-[13px] text-gray-500 hover:text-[#AE9B84] transition-colors hover:translate-x-1 duration-200"
                                                >
                                                    {item.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    </div>
);

const Sidebar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState([]);
    const [categories, setCategories] = useState([]);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch(`${API_URL}/api/categories`);
                if (!response.ok) throw new Error('Failed to fetch categories');
                const data = await response.json();

                const formattedCategories = data.map(cat => ({
                    name: cat.name,
                    items: cat.children ? cat.children.map(child => ({
                        name: child.name,
                        to: `/category/${child.category_id}`
                    })) : []
                }));

                setCategories(formattedCategories);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchCategories();
    }, []);

    const toggleCategory = (categoryName) => {
        setExpandedCategories(prev => {
            if (prev.includes(categoryName)) {
                return prev.filter(c => c !== categoryName);
            } else {
                return [...prev, categoryName];
            }
        });
    };

    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearch = () => {
        if (searchTerm.trim()) {
            navigate(`/search?keyword=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    return (
        <>
            <style>{`
                /* Animation Slide & Fade */
                @keyframes slideInLeft {
                    from { transform: translateX(-100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .animate-slide-in-left {
                    animation: slideInLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out forwards;
                }

                /* --- CUSTOM SCROLLBAR (Transparent Aesthetic) --- */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px; 
                    background-color: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(0, 0, 0, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb {
                    background-color: rgba(174, 155, 132, 0.5);
                }
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: rgba(0, 0, 0, 0.1) transparent;
                }
            `}</style>

            {/* --- MOBILE VIEW --- */}
            <div className="lg:hidden fixed top-32 left-0 z-40">
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-3 pr-4 bg-[#AE9B84] hover:bg-[#96836e] text-white rounded-r-full shadow-xl transition-transform transform hover:scale-105 active:scale-95 flex items-center justify-center border-y-2 border-r-2 border-white"
                    aria-label="Open Menu"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </button>
            </div>

            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden flex">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
                        onClick={() => setIsMobileMenuOpen(false)}
                    ></div>
                    <div className="relative w-[80%] max-w-[320px] h-full bg-[#f2f2f2] shadow-2xl flex flex-col animate-slide-in-left z-10">
                        <div className="h-1.5 w-full bg-[#AE9B84]"></div>
                        <div className="flex-grow overflow-hidden h-full">
                            <SidebarContent
                                onItemClick={() => setIsMobileMenuOpen(false)}
                                categories={categories}
                                expandedCategories={expandedCategories}
                                toggleCategory={toggleCategory}
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                handleSearch={handleSearch}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* --- DESKTOP VIEW --- */}
            <aside className="hidden lg:block w-[276px] flex-none font-sans">
                <div className="h-[530px] rounded-2xl shadow-md overflow-hidden border-transparent">
                    <SidebarContent
                        categories={categories}
                        expandedCategories={expandedCategories}
                        toggleCategory={toggleCategory}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        handleSearch={handleSearch}
                    />
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
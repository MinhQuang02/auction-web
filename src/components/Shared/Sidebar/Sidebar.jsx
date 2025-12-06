import { Link, NavLink } from 'react-router-dom';
import React from 'react';
import Panel from '../Panel';

const Sidebar = ({ showSearchBar, items }) => {
    return (
        <aside className="w-full lg:w-[276px] flex-none font-sans">
            <div className="rounded-2xl shadow-lg overflow-hidden flex flex-col h-full">
                
                {/* Search Bar Section */}
                {showSearchBar && (
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
                )}

                {/* Navigation Section */}
                <div className="bg-lightGray py-6 flex-grow">
                    <nav>
                        <ul className="flex flex-col text-[15px] text-[#1f1f1f]">
                        {items.map((item) => (
                            <li key={item.name} className="w-full">
                            <NavLink
                                to={item.to}
                                className={({ isActive }) =>
                                    `block w-full flex justify-between items-center px-4 py-4 
                                    font-semibold
                                    ${isActive ? 'bg-primary/60' : 'hover:bg-primary/30'}
                                    transition-all duration-300 ease-in-out`
                                }
                                >
                                <span>{item.name}</span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="2.5"
                                    stroke="currentColor"
                                    className="w-4 h-4 text-black transition-transform duration-300 ease-in-out"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                </svg>
                            </NavLink>
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

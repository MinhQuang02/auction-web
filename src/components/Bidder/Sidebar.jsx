import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const ChevronDownIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);

const Sidebar = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const menuGroups = [
        {
            title: 'Manage My Account',
            links: [
                { label: 'My Profile', to: '/profile' },
                { label: 'My Reviews', to: '/reviews' },
            ]
        },
        {
            title: 'My Orders',
            links: [
                { label: 'My Purchases', to: '/my-purchases' },
            ]
        },
        {
            title: 'My Products',
            links: [
                { label: 'My Wishlist', to: '/wishlist' },
                { label: 'My Auction Products', to: '/auctions' },
            ]
        }
    ];

    return (
        <aside className="w-full lg:w-[220px] flex-none pt-4 lg:pt-8">
            
            <div 
                className="lg:hidden flex justify-between items-center bg-gray-100 p-4 rounded-lg mb-4 cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="font-medium text-textDark">Account Menu</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            <div className={`${isOpen ? 'block' : 'hidden'} lg:block bg-transparent`}>
                <nav className="flex flex-col gap-6 lg:gap-8">
                    {menuGroups.map((group, index) => (
                        <div key={index}>
                            <h3 className="font-medium text-base mb-3 lg:mb-4 text-textDark">{group.title}</h3>
                            <ul className="flex flex-col gap-3 text-gray-500 text-sm pl-4 border-l-2 border-gray-100 ml-1">
                                {group.links.map((link, linkIndex) => {
                                    const isActive = location.pathname === link.to;
                                    
                                    return (
                                        <li key={linkIndex}>
                                            <Link 
                                                to={link.to} 
                                                className={`transition block ${
                                                    isActive 
                                                        ? 'text-primary font-medium translate-x-1' 
                                                        : 'hover:text-primary hover:text-gray-800 hover:translate-x-1' 
                                                }`}
                                                onClick={() => setIsOpen(false)} 
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;
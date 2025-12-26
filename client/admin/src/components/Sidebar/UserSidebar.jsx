import React from 'react';
import Sidebar from './SidebarLayout';

const categories = [
    { name: 'Woman’s Fashion', to: '/category' },
    { name: 'Men’s Fashion', to: '/category' },
    { name: 'Electronics', to: '/category' },
    { name: 'Home & Lifestyle', to: '/category' },
    { name: 'Medicine', to: '/category' },
    { name: 'Sports & Outdoor', to: '/category' },
    { name: 'Baby’s & Toys', to: '/category' },
    { name: 'Groceries & Pets', to: '/category' },
    { name: 'Health & Beauty', to: '/category' },
];

const UserSidebar = () => {
    return (
        <Sidebar showSearchBar={true} items={categories} />
    );
};

export default UserSidebar;

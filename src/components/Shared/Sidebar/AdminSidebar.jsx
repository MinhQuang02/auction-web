import React from 'react';
import Sidebar from './Sidebar';

const adminScreens = [
    { name: 'Dashboard', to: '/admin/dashboard'},
    { name: 'Categories', to: '/admin/categories'},
    { name: 'Auctions', to: '/admin/auctions'},
    { name: 'Users', to: '/admin/users'},
]

const AdminSidebar = () => {
    return (
        <Sidebar showSearchBar={false} items={adminScreens} />
    );
};

export default AdminSidebar;
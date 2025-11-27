const Sidebar = () => {
    const menuGroups = [
        {
            title: 'Manage My Account',
            links: [
                { label: 'My Profile', href: './profile.html', isActive: true },
                { label: 'My Reviews', href: './profile_review.html', isActive: false },
            ]
        },
        {
            title: 'My Orders',
            links: [
                { label: 'My Purchases', href: './auction-product.html', isActive: false },
            ]
        },
        {
            title: 'My Products',
            links: [
                { label: 'My Wishlist', href: '#', isActive: false },
                { label: 'My Auction Products', href: '#', isActive: false },
            ]
        }
    ];

    return (
        <aside className="w-full lg:w-[220px] flex-none hidden lg:block pt-8">
            <div className="bg-transparent">
                <nav className="flex flex-col gap-8">
                    {menuGroups.map((group, index) => (
                        <div key={index}>
                            <h3 className="font-medium text-base mb-4">{group.title}</h3>
                            <ul className="flex flex-col gap-3 text-gray-500 text-sm pl-4">
                                {group.links.map((link, linkIndex) => (
                                    <li key={linkIndex}>
                                        <a 
                                            href={link.href} 
                                            className={`transition ${
                                                link.isActive 
                                                    ? 'text-primary font-medium' // Style cho mục đang chọn (Active)
                                                    : 'hover:text-primary hover:text-gray-800' // Style mặc định
                                            }`}
                                        >
                                            {link.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;
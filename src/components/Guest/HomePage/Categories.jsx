import React from 'react';

// Import Icons (Navigation)
import prevIcon from '../../../assets/images/_prevIcon.svg';
import nextIcon from '../../../assets/images/_nextIcon.svg';

// Import Category Icons (Files)
import phoneIcon from '../../../assets/images/_phoneIcon.svg';
import computerIcon from '../../../assets/images/_computerIcon.svg';
import watchIcon from '../../../assets/images/_watchIcon.svg';
import cameraIcon from '../../../assets/images/_cameraIcon.svg';
import headphoneIcon from '../../../assets/images/_headphoneIcon.svg';
import gamingIcon from '../../../assets/images/_gamingIcon.svg';

const Categories = () => {
    // Dữ liệu danh mục
    // 'type': xác định nguồn icon là file ảnh ('img') hay mã svg trực tiếp ('svg')
    const categories = [
        { id: 1, name: 'Phones', type: 'img', src: phoneIcon },
        { id: 2, name: 'Computers', type: 'img', src: computerIcon },
        { id: 3, name: 'SmartWatch', type: 'img', src: watchIcon },
        { id: 4, name: 'Camera', type: 'img', src: cameraIcon, isActive: true }, // Item này đang Active trong HTML mẫu
        { id: 5, name: 'HeadPhones', type: 'img', src: headphoneIcon },
        { id: 6, name: 'Gaming', type: 'img', src: gamingIcon },
        { 
            id: 7, 
            name: 'Tablets', 
            type: 'svg', 
            path: <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 002.25-2.25v-15a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 4.5v15a2.25 2.25 0 002.25 2.25z" /> 
        },
        { 
            id: 8, 
            name: 'Drones', 
            type: 'svg', 
            path: <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /> 
        },
        { 
            id: 9, 
            name: 'Furniture', 
            type: 'svg', 
            path: <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" /> 
        },
        { 
            id: 10, 
            name: 'Shoes', 
            type: 'svg', 
            path: <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /> 
        },
    ];

    return (
        <section id="categories" className="container mx-auto px-5 lg:px-12 py-10">
            {/* Header Section */}
            <div className="flex justify-between items-end mb-14">
                <div>
                    <div className="flex items-center gap-4 mb-5">
                        <div className="w-5 h-10 bg-primary rounded"></div>
                        <span className="text-primary font-semibold">Categories</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-semibold tracking-wide">Browse By Category</h2>
                </div>
                
                {/* Navigation Arrows */}
                <div className="flex gap-2">
                    <div className="bg-gray-100 p-3 rounded-full cursor-pointer hover:bg-gray-200 transition">
                        <img src={prevIcon} alt="Prev" />
                    </div>
                    <div className="bg-gray-100 p-3 rounded-full cursor-pointer hover:bg-gray-200 transition">
                        <img src={nextIcon} alt="Next" />
                    </div>
                </div>
            </div>

            {/* Categories List */}
            <div className="flex gap-8 overflow-x-auto pb-6 scrollbar-hide snap-x">
                {categories.map((item) => {
                    // Logic style cho trạng thái Active và Inactive
                    const activeClasses = "bg-primary text-white shadow-lg";
                    const inactiveClasses = "border border-gray-300 hover:bg-primary hover:text-white hover:shadow-lg";
                    const containerClasses = item.isActive ? activeClasses : inactiveClasses;

                    // Logic icon: Active thì trắng sẵn, Inactive thì trắng khi hover
                    const iconClasses = item.isActive 
                        ? "invert brightness-0" 
                        : "group-hover:invert group-hover:brightness-0 transition-all";

                    return (
                        <div 
                            key={item.id} 
                            className={`flex-none w-[170px] snap-center rounded h-[145px] flex flex-col items-center justify-center gap-4 cursor-pointer group transition-all duration-300 ${containerClasses}`}
                        >
                            <div className={`w-14 h-14 flex items-center justify-center`}>
                                {item.type === 'img' ? (
                                    <img src={item.src} alt={item.name} className={iconClasses} />
                                ) : (
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        strokeWidth="1.5" 
                                        stroke="currentColor" 
                                        className={`w-10 h-10 ${iconClasses}`}
                                    >
                                        {item.path}
                                    </svg>
                                )}
                            </div>
                            <span className="font-poppins">{item.name}</span>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default Categories;
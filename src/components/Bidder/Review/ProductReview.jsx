import React from 'react';

const ProductReview = () => {
    // Dữ liệu đánh giá mẫu
    const reviews = [
        {
            id: 1,
            name: "Rajesh Patel",
            location: "Mumbai, India",
            avatar: "https://i.pravatar.cc/150?img=11",
            rating: 5,
            comment: "Absolutely love the style and warmth of the jacket. A perfect blend of fashion and functionality!"
        },
        {
            id: 2,
            name: "Emily Walker",
            location: "London, UK",
            avatar: "https://i.pravatar.cc/150?img=5",
            rating: 5,
            comment: "Adorable and comfortable! My daughter loves her new outfit. Thank you, StyleLoom, for dressing our little fashionista."
        },
        {
            id: 3,
            name: "Priya Sharma",
            location: "Delhi, India",
            avatar: "https://i.pravatar.cc/150?img=9",
            rating: 5,
            comment: "Perfect fit and exceptional quality. These jeans have become my go-to for casual and chic outings."
        },
        {
            id: 4,
            name: "Maria Rodriguez",
            location: "Mexico City, Mexico",
            avatar: "https://i.pravatar.cc/150?img=24",
            rating: 5,
            comment: "Stylish sneakers that don't compromise on comfort. StyleLoom knows how to balance fashion and functionality."
        }
    ];

    // Helper render sao (Tái sử dụng logic từ ProductDetail nếu cần, hoặc viết inline đơn giản)
    const renderStars = (count) => {
        return (
            <div className="flex text-[#EBC37E] text-xs gap-1">
                {[...Array(5)].map((_, i) => (
                    <span key={i}>{i < count ? '★' : '☆'}</span> // Dùng ký tự sao đơn giản hoặc SVG
                ))}
            </div>
        );
    };

    return (
        <div className="flex-grow w-full">
            
            {/* Header Section */}
            <div className="bg-[#F5F5F5] rounded-t shadow-sm p-8 md:px-12 md:py-8 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                
                {/* Title & Overall Rating */}
                <div>
                    <h2 className="text-xl font-medium text-primary mb-1">My Review</h2>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                        <span>by Quang Minh,</span>
                        
                        {/* Static 4-star rating display for header */}
                        <div className="flex text-[#FFAD33] text-xs">
                            {[1, 2, 3, 4].map(i => (
                                <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                            ))}
                            <svg className="w-3.5 h-3.5 text-gray-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        </div>
                        <span className="text-gray-500">(150 Reviews)</span>
                    </div>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-3 text-sm text-gray-600">
                    <button className="flex items-center gap-1 hover:text-black transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Previous
                    </button>
                    
                    <div className="flex items-center gap-1">
                        <button className="w-7 h-7 bg-[#AE9B84] text-white rounded flex items-center justify-center">1</button>
                        <button className="w-7 h-7 hover:bg-gray-200 rounded flex items-center justify-center">2</button>
                        <span className="w-7 h-7 flex items-center justify-center">...</span>
                        <button className="w-7 h-7 hover:bg-gray-200 rounded flex items-center justify-center">68</button>
                    </div>

                    <button className="flex items-center gap-1 hover:text-black transition">
                        Next
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </button>
                </div>
            </div>

            {/* Reviews Grid */}
            <div className="bg-[#EAEAEA] rounded-b shadow-lg p-8 md:px-12 md:py-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-dashed border-gray-400 border-t border-b md:border-none">
                    {reviews.map((review, index) => {
                        // Logic border cho lưới 2 cột:
                        // Item chẵn (0, 2...): có border phải và border dưới (trừ dòng cuối)
                        // Item lẻ (1, 3...): có border dưới (trừ dòng cuối)
                        // Tuy nhiên để đơn giản hoá giống HTML mẫu, ta set cứng class dựa trên index
                        
                        let borderClasses = "p-6 flex flex-col gap-4 ";
                        if (index === 0) borderClasses += "md:border-r md:border-b border-dashed border-gray-400"; // Top Left
                        else if (index === 1) borderClasses += "md:border-b border-dashed border-gray-400"; // Top Right
                        else if (index === 2) borderClasses += "md:border-r border-dashed border-gray-400"; // Bottom Left
                        else borderClasses += ""; // Bottom Right (No border)

                        return (
                            <div key={review.id} className={borderClasses}>
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-4 items-center">
                                        <img src={review.avatar} alt={review.name} className="w-12 h-12 rounded-full object-cover bg-gray-300" />
                                        <div>
                                            <h4 className="font-semibold text-base text-black">{review.name}</h4>
                                            <p className="text-xs font-mono text-gray-600">{review.location}</p>
                                        </div>
                                    </div>
                                    <div className="bg-[#D8D3CD] w-8 h-6 rounded flex items-center justify-center text-gray-500 text-xs cursor-pointer hover:bg-[#c2bdb6]">✉</div>
                                </div>
                                
                                {renderStars(review.rating)}
                                
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {review.comment}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ProductReview;
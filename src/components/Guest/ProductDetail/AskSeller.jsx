import React, { useState } from 'react';

const AskSeller = () => {
    // State để theo dõi câu hỏi nào đang được mở (null = đóng tất cả)
    const [activeIndex, setActiveIndex] = useState(null);

    // Hàm xử lý khi click vào câu hỏi
    const toggleFaq = (index) => {
        // Nếu click vào câu đang mở -> đóng lại (null), ngược lại -> mở câu đó (index)
        setActiveIndex(activeIndex === index ? null : index);
    };

    // Dữ liệu câu hỏi (Trích xuất từ HTML)
    const faqData = [
        {
            id: 1,
            question: "How do your products stay up-to-date with the latest technology?",
            author: "***quang",
            answer: "Our products are constantly updated through rigorous R&D. We partner with top tech firms to integrate the latest chips and materials as soon as they become available."
        },
        {
            id: 2,
            question: "What makes your products more durable than others on the market?",
            author: "***quang",
            answer: "Our products are built with high-quality materials and undergo rigorous testing processes. We conduct stress tests, drop tests, and long-term usage simulations to ensure durability."
        },
        {
            id: 3,
            question: "Are your products compatible with both Android and iOS devices?",
            author: "***quang",
            answer: "Yes, all our gamepads and keyboards are designed to be universally compatible via Bluetooth 5.0 and wired connections for both Android and iOS ecosystems."
        },
        {
            id: 4,
            question: "How do you balance aesthetics with functionality in your product design?",
            author: "***quang",
            answer: "We prioritize ergonomic design first, ensuring comfort for long sessions, then apply minimalist aesthetics with premium finishes that look great on any desk setup."
        }
    ];

    return (
        <section id="ask-seller" className="container mx-auto px-5 lg:px-12 py-10 font-sans text-[#1f1f1f]">
            
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 tracking-wide">Ask the Seller</h2>

            <div className="bg-[#F5F5F5] rounded-2xl shadow-lg p-6 md:p-10">
                
                {/* FAQ List Container */}
                <div className="flex flex-col gap-2" id="faq-container">
                    {faqData.map((item, index) => {
                        const isOpen = activeIndex === index;

                        return (
                            <div 
                                key={item.id}
                                className={`faq-item rounded-xl transition-all duration-300 overflow-hidden cursor-pointer border border-transparent hover:bg-gray-200/50 ${isOpen ? 'bg-white shadow-sm' : ''}`}
                                onClick={() => toggleFaq(index)}
                            >
                                {/* Question Header */}
                                <div className="flex justify-between items-center p-3 md:p-4">
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="font-bold text-sm md:text-base">{item.question}</h3>
                                        <span className="text-xs text-gray-500 font-medium">by {item.author}</span>
                                    </div>
                                    
                                    {/* Toggle Icon */}
                                    <div className={`faq-btn w-8 h-8 rounded-md flex flex-none items-center justify-center transition-all duration-300 bg-[#E0E0E0] text-gray-600`}>
                                        <svg 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            fill="none" 
                                            viewBox="0 0 24 24" 
                                            strokeWidth="2" 
                                            stroke="currentColor" 
                                            className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Answer Content */}
                                <div 
                                    className={`px-4 text-sm text-gray-600 leading-relaxed transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
                                >
                                    {item.answer}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Input Form Section */}
                <div className="mt-8 bg-[#E2E0DC] rounded-xl p-2 px-6 py-4 flex justify-between items-center">
                    <input 
                        type="text" 
                        placeholder="Enter your question?" 
                        className="bg-transparent border-none text-sm w-full focus:outline-none placeholder-gray-500 text-gray-700 h-full" 
                    />
                    <button className="p-2 hover:translate-x-1 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-black">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </button>
                </div>

            </div>
        </section>
    );
};

export default AskSeller;
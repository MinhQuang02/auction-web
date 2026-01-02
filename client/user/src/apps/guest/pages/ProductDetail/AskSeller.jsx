import React, { useState } from 'react';
import { useAuth } from "@context/AuthContext";

const AskSeller = ({ questions = [], productId }) => {
    const { isAuthenticated } = useAuth();
    const [activeIndex, setActiveIndex] = useState(null);

    const toggleFaq = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    const hasData = questions.length > 0;

    return (
        <section id="ask-seller" className="container mx-auto px-5 lg:px-12 py-10 font-sans text-[#1f1f1f]">

            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 tracking-wide">Ask the Seller</h2>

            <div className="bg-[#F5F5F5] rounded-2xl shadow-lg p-6 md:p-10">

                {/* FAQ List Container */}
                <div className="flex flex-col gap-2" id="faq-container">
                    {!hasData ? (
                        <div className="text-center text-gray-500 italic py-4">No questions asked yet.</div>
                    ) : (
                        questions.map((item, index) => {
                            const isOpen = activeIndex === index;
                            // Backend: question_text, answer_text, asker: { full_name }
                            // We need to mask asker name if not masked? It should be masked ideally. 
                            // Or format logic: ***name
                            const authorName = item.asker?.full_name || "Anonymous";
                            const questionText = item.question_text || "No text";
                            const answerText = item.answer_text || "Waiting for seller response...";

                            return (
                                <div
                                    key={item.question_id || index}
                                    className={`faq-item rounded-xl transition-all duration-300 overflow-hidden cursor-pointer border border-transparent hover:bg-gray-200/50 ${isOpen ? 'bg-white shadow-sm' : ''}`}
                                    onClick={() => toggleFaq(index)}
                                >
                                    {/* Question Header */}
                                    <div className="flex justify-between items-start p-3 md:p-4">

                                        <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:gap-2 w-full pr-8 md:pr-4">
                                            <h3 className="font-bold text-sm md:text-base leading-snug">{questionText}</h3>
                                            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">by {authorName}</span>
                                        </div>

                                        {/* Toggle Icon (Giữ vị trí bên phải) */}
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
                                        {answerText}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Input Form Section */}
                {isAuthenticated && (
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
                )}

            </div>
        </section>
    );
};

export default AskSeller;
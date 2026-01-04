import React, { useState } from 'react';
import { useAuth } from "@context/AuthContext";
import { useToast } from "../../../../components/ui/Toast";

const API_URL = import.meta.env.VITE_API_URL;

const AskSeller = ({ questions = [], productId, sellerId, onRefresh }) => {
    const { isAuthenticated, user } = useAuth();
    const { addToast } = useToast();
    const [activeIndex, setActiveIndex] = useState(null);
    const [questionInput, setQuestionInput] = useState("");
    const [replyInput, setReplyInput] = useState("");
    const [replyingTo, setReplyingTo] = useState(null);

    const toggleFaq = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    const hasData = questions.length > 0;
    // sellerId is passed as int or string, user.id is potentially string/int. standardizing to int for comparison
    const isSeller = isAuthenticated && user && (parseInt(user.id) === parseInt(sellerId) || parseInt(user.user_id) === parseInt(sellerId));

    const handlePostQuestion = async () => {
        if (!questionInput.trim()) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/products/${productId}/questions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: questionInput })
            });
            if (res.ok) {
                setQuestionInput("");
                if (onRefresh) onRefresh();
            } else {
                addToast("Failed to post question", "error");
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handlePostReply = async (questionId) => {
        if (!replyInput.trim()) return;
        try {
            const token = localStorage.getItem('token');
            // Endpoint matches router: /questions/:questionId/reply
            // Note: The router prefix is /api/products, so full path is /api/products/questions/:questionId/reply
            const res = await fetch(`${API_URL}/api/products/questions/${questionId}/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ answer: replyInput })
            });

            if (res.ok) {
                setReplyInput("");
                setReplyingTo(null);
                if (onRefresh) onRefresh();
            } else {
                addToast("Failed to reply", "error");
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <section id="ask-seller" className="container mx-auto px-5 lg:px-12 py-10 font-sans text-[#1f1f1f]">

            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 tracking-wide">Ask the Seller</h2>

            <div className="bg-[#F5F5F5] rounded-2xl shadow-lg p-6 md:p-10">

                {/* FAQ List Container */}
                <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300" id="faq-container">
                    {!hasData ? (
                        <div className="text-center text-gray-500 italic py-4">No questions asked yet.</div>
                    ) : (
                        questions.map((item, index) => {
                            const isOpen = activeIndex === index;
                            const rawName = item.asker?.full_name || "Anonymous";
                            const authorName = rawName.startsWith("***") ? rawName : `***${rawName.slice(-3)}`;

                            const questionText = item.question_text || "No text";
                            const answerText = item.answer_text;

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
                                        <div className={`faq-btn w-8 h-8 rounded-md flex flex-none items-center justify-center transition-all duration-300 bg-[#E0E0E0] text-gray-600`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Answer & Logic */}
                                    <div className={`px-4 text-sm text-gray-600 leading-relaxed transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`} onClick={(e) => e.stopPropagation()}>
                                        {answerText ? (
                                            <>
                                                <div className="mt-2 p-3 bg-gray-50 rounded border-l-4 border-[#AE9B84]">
                                                    <span className="font-bold text-[#AE9B84] block mb-1">Seller's Reply:</span>
                                                    {answerText}
                                                </div>
                                            </>
                                        ) : (
                                            isSeller ? (
                                                <div className="mt-2">
                                                    {replyingTo === item.question_id ? (
                                                        <div className="flex flex-col gap-2">
                                                            <textarea
                                                                value={replyInput}
                                                                onChange={(e) => setReplyInput(e.target.value)}
                                                                placeholder="Write your reply..."
                                                                className="w-full p-2 border rounded text-sm focus:outline-none focus:border-[#AE9B84]"
                                                                rows="3"
                                                            />
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handlePostReply(item.question_id)}
                                                                    className="bg-[#AE9B84] text-white px-3 py-1 text-xs rounded hover:bg-[#9c8a74]"
                                                                >
                                                                    Send Reply
                                                                </button>
                                                                <button
                                                                    onClick={() => { setReplyingTo(null); setReplyInput(""); }}
                                                                    className="bg-gray-300 text-black px-3 py-1 text-xs rounded hover:bg-gray-400"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => { setReplyingTo(item.question_id); setReplyInput(""); }}
                                                            className="text-[#AE9B84] font-bold text-xs hover:underline"
                                                        >
                                                            Reply to this question
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="italic text-gray-400">Waiting for seller response...</span>
                                            )
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Input Form Section (Only for non-sellers or logged out users, though guests cant see this usually) */}
                {/* Actually Guests see the list but Input requires Auth. Seller sees list and reply options. */}
                {/* Bidder (Authenticated & !isSeller) sees Input */}
                {isAuthenticated && !isSeller && (
                    <div className="mt-8 bg-[#E2E0DC] rounded-xl p-2 px-6 py-4 flex justify-between items-center">
                        <input
                            type="text"
                            value={questionInput}
                            onChange={(e) => setQuestionInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handlePostQuestion()}
                            placeholder="Enter your question?"
                            className="bg-transparent border-none text-sm w-full focus:outline-none placeholder-gray-500 text-gray-700 h-full"
                        />
                        <button
                            onClick={handlePostQuestion}
                            className="p-2 hover:translate-x-1 transition-transform"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-black">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Visual Hint for Seller */}
                {isSeller && hasData && (
                    <div className="mt-4 text-center text-xs text-gray-500">
                        You are the seller. Expand specific questions to reply.
                    </div>
                )}

            </div>
        </section>
    );
};

export default AskSeller;
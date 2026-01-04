import React, { useState, useEffect } from "react";
import Panel from "@shared/components/Panel";
import { useAuth } from "@context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const AskSeller = ({ productId, sellerName, isOwner }) => {
  const { isAuthenticated } = useAuth();
  
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [replyText, setReplyText] = useState("");
  const [activeReplyId, setActiveReplyId] = useState(null);

  // Fetch Questions
  const fetchQuestions = async () => {
    try {
        const res = await fetch(`${API_URL}/api/products/${productId}/questions`);
        if (res.ok) setQuestions(await res.json());
    } catch (err) {
        console.error("QA Fetch Error", err);
    }
  };

  useEffect(() => {
    if (productId) fetchQuestions();
  }, [productId]);

  // Post Question
  const handleAsk = async () => {
    if (!newQuestion.trim()) return;
    try {
        const token = localStorage.getItem("token");
        await fetch(`${API_URL}/api/products/${productId}/questions`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json", 
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({ content: newQuestion })
        });
        setNewQuestion("");
        fetchQuestions();
    } catch (err) {
        alert("Failed to post question. Please login.");
    }
  };

  // Post Reply (Seller Only)
  const handleReply = async (questionId) => {
    if (!replyText.trim()) return;
    try {
        const token = localStorage.getItem("token");
        await fetch(`${API_URL}/api/products/questions/${questionId}/reply`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json", 
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({ answer: replyText })
        });
        setReplyText("");
        setActiveReplyId(null);
        fetchQuestions();
    } catch (err) {
        alert("Failed to reply");
    }
  };

  return (
    <section className="container mx-auto px-5 lg:px-12 py-10">
      <Panel className="p-8 rounded-2xl bg-white shadow-sm border border-gray-100">
        <h3 className="text-2xl font-bold mb-6">Questions & Answers</h3>
        
        {/* Ask Question Box (Only for Non-Sellers) */}
        {!isOwner && isAuthenticated && (
            <div className="mb-8 flex gap-4">
                <input 
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#AD9C86]"
                    placeholder={`Ask ${sellerName || "the seller"} a question...`}
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                />
                <button 
                    onClick={handleAsk}
                    className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800"
                >
                    Ask
                </button>
            </div>
        )}

        {/* Questions List */}
        <div className="space-y-6">
            {questions.length === 0 && (
                <p className="text-gray-400 text-center py-4">No questions yet. Be the first to ask!</p>
            )}

            {questions.map((q) => (
                <div key={q.question_id} className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <div className="flex gap-3">
                        <div className="bg-gray-200 text-gray-600 w-8 h-8 flex items-center justify-center rounded-full font-bold text-xs">Q</div>
                        <div className="flex-1">
                            <p className="font-semibold text-gray-900">{q.question_text}</p>
                            <p className="text-xs text-gray-400 mt-1">by {q.asker?.full_name} • {new Date(q.question_time).toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Answer (If exists) */}
                    {q.answer_text && (
                        <div className="flex gap-3 mt-4 ml-6 pl-4 border-l-2 border-[#AD9C86]">
                            <div className="bg-[#AD9C86] text-white w-8 h-8 flex items-center justify-center rounded-full font-bold text-xs">A</div>
                            <div className="flex-1">
                                <p className="text-gray-800">{q.answer_text}</p>
                                <p className="text-xs text-gray-400 mt-1">Seller Response</p>
                            </div>
                        </div>
                    )}

                    {/* Seller Reply Input (If Owner & No Answer yet) */}
                    {isOwner && !q.answer_text && (
                        <div className="mt-4 ml-11">
                            {activeReplyId === q.question_id ? (
                                <div className="flex gap-2">
                                    <input 
                                        className="flex-1 border rounded-lg px-3 py-2 text-sm"
                                        placeholder="Type your answer..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        autoFocus
                                    />
                                    <button onClick={() => handleReply(q.question_id)} className="bg-[#AD9C86] text-white px-4 rounded-lg text-sm">Send</button>
                                    <button onClick={() => setActiveReplyId(null)} className="text-gray-500 text-sm">Cancel</button>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => setActiveReplyId(q.question_id)}
                                    className="text-sm text-[#AD9C86] font-bold hover:underline"
                                >
                                    Reply to this question
                                </button>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
      </Panel>
    </section>
  );
};

export default AskSeller;
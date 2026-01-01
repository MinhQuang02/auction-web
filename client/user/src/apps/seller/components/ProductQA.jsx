import React, { useState, useEffect } from "react";
import { useAuth } from "@context/AuthContext";
import Panel from "@shared/components/Panel";

const API_URL = import.meta.env.VITE_API_URL;

const ProductQA = ({ productId, sellerId }) => {
  const { user, isAuthenticated } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [replyText, setReplyText] = useState("");
  const [activeReplyId, setActiveReplyId] = useState(null);

  const isSeller = isAuthenticated && user?.id === sellerId;

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
        alert("Failed to post question");
    }
  };

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
    <div className="mt-10 max-w-4xl mx-auto">
      <h3 className="text-2xl font-bold mb-6">Questions & Answers</h3>
      
      {/* List */}
      <div className="space-y-6 mb-8">
        {questions.length === 0 && <p className="text-gray-400">No questions yet.</p>}
        
        {questions.map((q) => (
            <div key={q.question_id} className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-start gap-4">
                    <div className="bg-gray-100 p-2 rounded-full font-bold text-gray-500">Q</div>
                    <div className="flex-1">
                        {/* UPDATED FIELD NAME */}
                        <p className="font-semibold text-gray-900">{q.question_text}</p>
                        <p className="text-xs text-gray-400 mt-1">
                            by {q.asker?.full_name} • {new Date(q.question_time).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {/* Answer Section */}
                {/* UPDATED FIELD NAME */}
                {q.answer_text && (
                    <div className="flex items-start gap-4 mt-4 ml-8 border-l-4 border-[#AD9C86] pl-4">
                        <div className="bg-[#AD9C86] text-white p-2 rounded-full font-bold text-xs">A</div>
                        <div>
                            <p className="text-gray-800">{q.answer_text}</p>
                            <p className="text-xs text-gray-400 mt-1">Seller Response</p>
                        </div>
                    </div>
                )}

                {/* Seller Reply Box */}
                {isSeller && !q.answer_text && (
                    <div className="mt-4 ml-12">
                        {activeReplyId === q.question_id ? (
                            <div className="flex gap-2">
                                <input 
                                    className="border rounded px-3 py-2 w-full text-sm"
                                    placeholder="Type your answer..." 
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                />
                                <button onClick={() => handleReply(q.question_id)} className="bg-black text-white px-4 rounded text-sm">Send</button>
                                <button onClick={() => setActiveReplyId(null)} className="text-gray-500 text-sm">Cancel</button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => setActiveReplyId(q.question_id)}
                                className="text-sm text-[#AD9C86] font-semibold hover:underline"
                            >
                                Reply to this question
                            </button>
                        )}
                    </div>
                )}
            </div>
        ))}
      </div>

      {/* Ask Box */}
      {isAuthenticated && !isSeller && (
        <Panel className="p-6 bg-gray-50 rounded-xl">
            <h4 className="font-bold mb-2">Ask the seller a question</h4>
            <textarea
                className="w-full p-3 border rounded-lg focus:ring-2 ring-[#AD9C86] outline-none"
                rows="3"
                placeholder="Details about the item..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
            />
            <button 
                onClick={handleAsk}
                className="mt-3 bg-[#AD9C86] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#968672]"
            >
                Post Question
            </button>
        </Panel>
      )}
    </div>
  );
};

export default ProductQA;
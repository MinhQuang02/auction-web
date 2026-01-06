import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

const ProductReview = () => {
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({ avg: 0, count: 0, names: '' });
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Profile for stats and name
                const profileRes = await fetch(`${API_URL}/api/users/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const profileData = await profileRes.json();

                // Fetch Reviews
                const reviewsRes = await fetch(`${API_URL}/api/ratings/my-reviews`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const reviewsData = await reviewsRes.json();

                if (profileRes.ok) {
                    setStats({
                        avg: profileData.avg_rating || 0,
                        count: profileData.total_ratings || 0,
                        names: profileData.full_name || 'User'
                    });
                }

                if (reviewsRes.ok) {
                    setReviews(reviewsData);
                }

            } catch (err) {
                console.error("Failed to load reviews data", err);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchData();
    }, [token]);


    const renderRecommendation = (val) => {
        const isPositive = parseInt(val) === 1;
        const isNegative = parseInt(val) === -1;

        if (isPositive) {
            return (
                <div className="flex items-center gap-1 text-xs font-bold text-[#AE9B84]">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M2.203 12.043l3.355 9.773a1 1 0 00.95.674h12.553a1 1 0 00.95-.68l2.956-9.288a1 1 0 00-.95-1.3l-5.6-.002a2 2 0 01-1.996-2.181l.666-6.6a1 1 0 00-1.63-.787l-7.794 7.794a1 1 0 00-.002.002l-.638 1.93a1 1 0 01-.87.665z"></path></svg>
                    <span>Recommended</span>
                </div>
            )
        }
        if (isNegative) {
            return (
                <div className="flex items-center gap-1 text-xs font-bold text-[#4B4B4B]">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M21.797 11.957l-3.355-9.773a1 1 0 00-.95-.674H4.939a1 1 0 00-.95.68L1.033 11.478a1 1 0 00.95 1.3l5.6 .002a2 2 0 011.996 2.181l-.666 6.6a1 1 0 001.63 .787l7.794-7.794a1 1 0 00.002-.002l.638-1.93a1 1 0 01.87-.665z"></path></svg>
                    <span>Not Recommended</span>
                </div>
            )
        }
        return <span className="text-gray-400 text-xs">No Status</span>;
    };

    if (loading) return <div>Loading reviews...</div>;

    return (
        <div className="flex-grow w-full">

            {/* Header Section */}
            <div className="bg-[#F5F5F5] rounded-t shadow-sm p-8 md:px-12 md:py-8 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">

                {/* Title & Overall Rating */}
                <div>
                    <h2 className="text-xl font-medium text-primary mb-1">My Review</h2>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                        <span>by {stats.names},</span>

                        {/* Rating display for header - Numeric */}
                        <span className={`font-bold ${stats.avg >= 0 ? 'text-[#AE9B84]' : 'text-[#4B4B4B]'}`}>
                            {stats.avg > 0 ? "+" : ""}{parseFloat(stats.avg || 0).toFixed(1)} Rating
                        </span>
                        <span className="text-gray-500">({stats.count} Reviews)</span>
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
                    </div>

                    <button className="flex items-center gap-1 hover:text-black transition">
                        Next
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </button>
                </div>
            </div>

            {/* Reviews Grid */}
            <div className="bg-[#EAEAEA] rounded-b shadow-lg p-8 md:px-12 md:py-10">
                {reviews.length === 0 ? (
                    <div className="text-center text-gray-500">No reviews yet.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-dashed border-gray-400 border-t border-b md:border-none">
                        {reviews.map((review, index) => {

                            let borderClasses = "p-6 flex flex-col gap-4 ";
                            // Naive styling logic for grid borders
                            if (index % 2 === 0) borderClasses += "md:border-r border-dashed border-gray-400 ";
                            if (index < reviews.length - 2) borderClasses += "border-b border-dashed border-gray-400 ";
                            // Adjust border logic for simple list to grid mapping
                            const isLastRow = index >= reviews.length - (reviews.length % 2 === 0 ? 2 : 1);
                            if (!isLastRow) {
                                // border bottom
                                borderClasses += "border-b border-dashed border-gray-400 ";
                            }

                            return (
                                <div key={review.rating_id || index} className={borderClasses}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-4 items-center">
                                            <img
                                                src={"https://i.pravatar.cc/150?u=" + (review.rater_id || index)}
                                                alt={review.rater?.full_name}
                                                className="w-12 h-12 rounded-full object-cover bg-gray-300"
                                            />
                                            <div>
                                                <h4 className="font-semibold text-base text-black">{review.rater?.full_name || "Anonymous"}</h4>
                                                <p className="text-xs font-mono text-gray-600">{review.rater?.address || "Unknown Location"}</p>
                                            </div>
                                        </div>
                                        {/* Mail Button */}
                                        <a
                                            href={`mailto:${review.rater?.email || ''}`}
                                            className="bg-[#D8D3CD] w-8 h-6 rounded flex items-center justify-center text-gray-500 text-xs cursor-pointer hover:bg-[#c2bdb6]"
                                            title={`Email ${review.rater?.full_name || 'User'}`}
                                        >
                                            ✉
                                        </a>
                                    </div>

                                    {/* Recommendation Tag */}
                                    {renderRecommendation(review.rating_value)}

                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {review.comment}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductReview;
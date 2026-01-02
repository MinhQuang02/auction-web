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


    const renderStars = (rating) => {
        return (
            <div className="flex text-[#EBC37E] text-xs gap-1">
                {[...Array(5)].map((_, i) => (
                    <span key={i}>{i < rating ? '★' : '☆'}</span>
                ))}
            </div>
        );
    };

    // Helper to render stars for header (SVG version from original code)
    const renderHeaderStars = (avgRating) => {
        const fullStars = Math.round(avgRating);
        return (
            <div className="flex text-[#FFAD33] text-xs">
                {[...Array(5)].map((_, i) => (
                    <svg key={i} className={`w-3.5 h-3.5 ${i < fullStars ? 'fill-current' : 'text-gray-400 fill-current'}`} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
        );
    }

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

                        {/* Rating display for header */}
                        {renderHeaderStars(stats.avg)}
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
                        {/* 
                           Simplified pagination for dynamic data. 
                           Ideally should be calculated based on total pages.
                        */}
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
                            // The original code had static indices logic. For dynamic list:
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
                                        <div className="bg-[#D8D3CD] w-8 h-6 rounded flex items-center justify-center text-gray-500 text-xs cursor-pointer hover:bg-[#c2bdb6]">✉</div>
                                    </div>

                                    {renderStars(review.rating_value)}

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
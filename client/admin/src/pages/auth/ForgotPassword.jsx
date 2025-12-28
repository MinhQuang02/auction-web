import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [email, setEmail] = useState('');

    const onlineImage = "https://images.unsplash.com/photo-1477414348463-c0eb7f1359b6?q=80&w=2670&auto=format&fit=crop";

    const handleSubmit = (e) => {
        e.preventDefault();
        
        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
            setIsSuccess(true);
        }, 1500);
    };

    return (
        <div className="bg-[#F4F4F4] min-h-screen w-full flex items-center justify-center p-4 lg:p-6 text-[#1F1F1F] font-sans">
            <div className="w-full h-full max-w-[1600px] flex gap-10 lg:gap-20 bg-white lg:bg-transparent rounded-[32px] lg:rounded-none shadow-xl lg:shadow-none overflow-hidden min-h-[600px]">
                
                {/* --- Left Side: Content --- */}
                <div className="w-full lg:w-5/12 flex flex-col justify-center px-4 md:px-12 lg:pl-16 lg:pr-0">
                    <div className="w-full max-w-[450px] mx-auto lg:mx-0">
                        
                        {!isSuccess && (
                            <div className="transition-all duration-500">
                                <h1 className="text-4xl font-bold mb-3 tracking-tight">Forgot Password?</h1>
                                <p className="text-gray-400 text-sm mb-10 leading-relaxed">
                                    Don't worry! It happens. Please enter the email address associated with your account.
                                </p>
                                
                                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                                    
                                    {/* Email Input with Floating Label */}
                                    <div className="relative">
                                        <input 
                                            type="email" 
                                            id="email" 
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full h-[52px] bg-transparent border border-gray-300 rounded px-4 text-sm outline-none text-black focus:border-[#A3907B] peer transition-colors placeholder-transparent" 
                                            placeholder="Enter your email"
                                        />
                                        <label 
                                            htmlFor="email" 
                                            className="absolute left-3 -top-2.5 bg-white lg:bg-[#F4F4F4] px-1 text-xs text-gray-400 transition-all 
                                                    peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400
                                                    peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[#A3907B]"
                                        >
                                            Email Address
                                        </label>
                                    </div>

                                    {/* Submit Button */}
                                    <button 
                                        type="submit" 
                                        disabled={isLoading}
                                        className={`w-full h-[50px] bg-[#AD9C86] hover:bg-[#968672] text-white font-medium rounded text-sm transition shadow-sm flex items-center justify-center gap-2 ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}`}
                                    >
                                        {isLoading ? 'Sending...' : 'Send Reset Code'}
                                    </button>

                                    {/* Back to Login Link */}
                                    <div className="text-center mt-4">
                                        <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-black transition flex items-center justify-center gap-2 group">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 group-hover:-translate-x-1 transition-transform">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                                            </svg>
                                            Back to Sign in
                                        </Link>
                                    </div>

                                </form>
                            </div>
                        )}

                        {isSuccess && (
                            <div className="w-full text-center animate-fade-in-up">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-green-600">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                </div>
                                <h2 className="text-3xl font-bold mb-2">Check your mail</h2>
                                <p className="text-gray-500 text-sm mb-8">
                                    We have sent a password recover instructions to your email.
                                </p>
                                <button onClick={() => window.location.reload()} className="w-full h-[50px] bg-[#AD9C86] hover:bg-[#968672] text-white font-medium rounded text-sm transition shadow-sm">
                                    Open Email App
                                </button>
                                <div className="text-center mt-6">
                                    <p className="text-sm text-gray-500">
                                        Did not receive the email?{' '}
                                        <button className="text-black font-medium hover:underline" onClick={() => window.location.reload()}>
                                            Resend
                                        </button>
                                    </p>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* --- Right Side: Image --- */}
                <div className="hidden lg:block w-7/12 h-full relative">
                    <img 
                        src={onlineImage} 
                        alt="Foggy Autumn Forest" 
                        className="w-full h-full object-cover rounded-[32px] shadow-sm brightness-[0.85]" 
                    />
                </div>

            </div>
            
            {/* Inline Style for Animation */}
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default ForgotPassword;
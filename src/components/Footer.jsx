import React from 'react';
import { Link } from 'react-router-dom';

import sendIcon from '../assets/images/_sendIcon.svg';
import qrCode from '../assets/images/_qrCode.png';
import playStore from '../assets/images/_playStore.png';
import appStore from '../assets/images/_appStore.png';
import fbIcon from '../assets/images/_fbIcon.svg';
import twitterIcon from '../assets/images/_twitterIcon.svg';
import instaIcon from '../assets/images/_instaIcon.svg';
import linkedInIcon from '../assets/images/_linkedInIcon.svg';
import copyrightIcon from '../assets/images/_copyrightIcon.svg';

const Footer = () => {
    return (
        <footer className="bg-bgDark text-white pt-12 pb-6 lg:pt-20">
            <div className="container mx-auto px-5 lg:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 text-center sm:text-left">
                
                {/* Column 1: Subscribe */}
                <div className="flex flex-col gap-3 lg:gap-4 items-center sm:items-start">
                    <h4 className="font-inter font-bold text-2xl">Exclusive</h4>
                    <h5 className="font-poppins font-medium text-xl">Subscribe</h5>
                    <p className="font-poppins text-base">Get 10% off your first order</p>
                    <div className="flex border-[1.5px] border-white rounded px-4 py-3 w-full max-w-[320px] sm:max-w-full">
                        <input type="email" placeholder="Enter your email" className="bg-transparent border-none text-white w-full focus:outline-none placeholder-white/40" />
                        <button>
                            <img src={sendIcon} alt="Send" />
                        </button>
                    </div>
                </div>

                {/* Column 2: Support */}
                <div className="flex flex-col gap-3 lg:gap-4 items-center sm:items-start">
                    <h4 className="font-inter font-bold text-2xl">Support</h4>
                    <p className="font-poppins text-base leading-relaxed max-w-[200px] sm:max-w-none mx-auto sm:mx-0">
                        227, Nguyen Van Cu Street,<br/>Ward 4, District 5
                    </p>
                    <a href="mailto:mphanquang06@gmail.com" className="font-poppins text-base hover:text-primary">mphanquang06@gmail.com</a>
                    <a href="tel:+84912991873" className="font-poppins text-base hover:text-primary">+84 912-991-873</a>
                </div>

                {/* Column 3: Account */}
                <div className="flex flex-col gap-3 lg:gap-4 items-center sm:items-start">
                    <h4 className="font-inter font-bold text-2xl">Account</h4>
                    <ul className="flex flex-col gap-3 lg:gap-4 font-poppins text-base">
                        <li><Link to="/profile" className="hover:text-primary">My Account</Link></li>
                        <li><Link to="/login" className="hover:text-primary">Login / Register</Link></li>
                        <li><Link to="/billing" className="hover:text-primary">Cart</Link></li>
                        <li><Link to="/wishlist" className="hover:text-primary">Wishlist</Link></li>
                        <li><Link to="/" className="hover:text-primary">Shop</Link></li>
                    </ul>
                </div>

                {/* Column 4: Quick Link */}
                <div className="flex flex-col gap-3 lg:gap-4 items-center sm:items-start">
                    <h4 className="font-inter font-bold text-2xl">Quick Link</h4>
                    <ul className="flex flex-col gap-3 lg:gap-4 font-poppins text-base">
                        <li><Link to="/" className="hover:text-primary">Privacy Policy</Link></li>
                        <li><Link to="/" className="hover:text-primary">Terms Of Use</Link></li>
                        <li><Link to="/" className="hover:text-primary">FAQ</Link></li>
                        <li><Link to="/" className="hover:text-primary">Contact</Link></li>
                    </ul>
                </div>

                {/* Column 5: Download App */}
                <div className="flex flex-col gap-3 lg:gap-4 items-center sm:items-start">
                    <h4 className="font-inter font-bold text-2xl">Download App</h4>
                    <p className="text-xs opacity-70">Save $3 with App New User Only</p>
                    <div className="flex items-center gap-2">
                        <img src={qrCode} alt="QR" className="w-20 h-20" />
                        <div className="flex flex-col gap-1">
                            <img src={playStore} alt="Play Store" className="h-10 w-auto" />
                            <img src={appStore} alt="App Store" className="h-10 w-auto" />
                        </div>
                    </div>
                    <div className="flex gap-6 mt-2 justify-center sm:justify-start">
                        <a href="#"><img src={fbIcon} alt="FB" /></a>
                        <a href="#"><img src={twitterIcon} alt="Twitter" /></a>
                        <a href="#"><img src={instaIcon} alt="Insta" /></a>
                        <a href="#"><img src={linkedInIcon} alt="LinkedIn" /></a>
                    </div>
                </div>
            </div>

            {/* Copyright Section */}
            <div className="mt-12 lg:mt-16 py-4 border-t border-white/40">
                <div className="container mx-auto flex flex-col sm:flex-row justify-center items-center gap-2 opacity-60 px-4 text-center">
                    <img src={copyrightIcon} alt="Copyright" className="w-4 h-4 sm:w-auto sm:h-auto" />
                    <span className="font-poppins text-sm sm:text-base">Copyright CodeShift 2025. All right reserved</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
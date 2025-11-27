import React from 'react';
// Import tất cả các hình ảnh được sử dụng trong Footer
import sendIcon from '../assets/images/I3_1152_128_1546_128_1539.svg';
import qrCode from '../assets/images/991387c05dd6d44594e01b675513068803e2426d.png';
import playStore from '../assets/images/a61d4c7110b18ab55a1e1a07ebf54a46ebb07284.png';
import appStore from '../assets/images/38932d5accb54c528f9bcf326ca48ea29bd6d890.png';
import fbIcon from '../assets/images/I3_1152_142_1664.svg';
import twitterIcon from '../assets/images/I3_1152_142_1665_142_1608.svg';
import instaIcon from '../assets/images/I3_1152_142_1666_142_1637.svg';
import linkedInIcon from '../assets/images/I3_1152_142_1667.svg';
import copyrightIcon from '../assets/images/I3_1152_128_1591_128_1587.svg';

const Footer = () => {
    return (
        <footer className="bg-bgDark text-white pt-20">
            <div className="container mx-auto px-5 lg:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
                
                {/* 1. Exclusive & Subscribe */}
                <div className="flex flex-col gap-4">
                    <h4 className="font-inter font-bold text-2xl">Exclusive</h4>
                    <h5 className="font-poppins font-medium text-xl">Subscribe</h5>
                    <p className="font-poppins text-base">Get 10% off your first order</p>
                    <div className="flex border-[1.5px] border-white rounded px-4 py-3">
                        <input type="email" placeholder="Enter your email" className="bg-transparent border-none text-white w-full focus:outline-none placeholder-white/40" />
                        <button>
                            <img src={sendIcon} alt="Send" />
                        </button>
                    </div>
                </div>

                {/* 2. Support */}
                <div className="flex flex-col gap-4">
                    <h4 className="font-inter font-bold text-2xl">Support</h4>
                    <p className="font-poppins text-base leading-relaxed">227, Nguyen Van Cu Street,<br/>Ward 4, District 5</p>
                    <a href="mailto:mphanquang06@gmail.com" className="font-poppins text-base hover:text-primary">mphanquang06@gmail.com</a>
                    <a href="tel:+84912991873" className="font-poppins text-base hover:text-primary">+84 912-991-873</a>
                </div>

                {/* 3. Account */}
                <div className="flex flex-col gap-4">
                    <h4 className="font-inter font-bold text-2xl">Account</h4>
                    <ul className="flex flex-col gap-4 font-poppins text-base">
                        <li><a href="#" className="hover:text-primary">My Account</a></li>
                        <li><a href="#" className="hover:text-primary">Login / Register</a></li>
                        <li><a href="#" className="hover:text-primary">Cart</a></li>
                        <li><a href="#" className="hover:text-primary">Wishlist</a></li>
                        <li><a href="#" className="hover:text-primary">Shop</a></li>
                    </ul>
                </div>

                {/* 4. Quick Link */}
                <div className="flex flex-col gap-4">
                    <h4 className="font-inter font-bold text-2xl">Quick Link</h4>
                    <ul className="flex flex-col gap-4 font-poppins text-base">
                        <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
                        <li><a href="#" className="hover:text-primary">Terms Of Use</a></li>
                        <li><a href="#" className="hover:text-primary">FAQ</a></li>
                        <li><a href="#" className="hover:text-primary">Contact</a></li>
                    </ul>
                </div>

                {/* 5. Download App & Socials */}
                <div className="flex flex-col gap-4">
                    <h4 className="font-inter font-bold text-2xl">Download App</h4>
                    <p className="text-xs opacity-70">Save $3 with App New User Only</p>
                    <div className="flex items-center gap-2">
                        <img src={qrCode} alt="QR" className="w-20 h-20" />
                        <div className="flex flex-col gap-1">
                            <img src={playStore} alt="Play Store" className="h-10 w-auto" />
                            <img src={appStore} alt="App Store" className="h-10 w-auto" />
                        </div>
                    </div>
                    <div className="flex gap-6 mt-2">
                        <a href="#"><img src={fbIcon} alt="FB" /></a>
                        <a href="#"><img src={twitterIcon} alt="Twitter" /></a>
                        <a href="#"><img src={instaIcon} alt="Insta" /></a>
                        <a href="#"><img src={linkedInIcon} alt="LinkedIn" /></a>
                    </div>
                </div>
            </div>

            {/* Copyright Section */}
            <div className="mt-16 py-4 border-t border-white/40">
                <div className="container mx-auto flex justify-center items-center gap-1.5 opacity-60">
                    <img src={copyrightIcon} alt="Copyright" />
                    <span className="font-poppins text-base">Copyright CodeShift 2025. All right reserved</span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
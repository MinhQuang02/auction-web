import logo from '../assets/images/3_1793.svg';
import wishlistIcon from '../assets/images/3_1806.svg';

const Header = () => {
    return (
        <header className="bg-[#F6F6F6] border-b border-gray-200 py-5 sticky top-0 z-50">
            <div className="container mx-auto px-5 lg:px-12 flex flex-wrap justify-between items-center relative">
                
                <div className="flex items-center gap-2 order-2 lg:order-1 w-full lg:w-auto justify-center lg:justify-start mt-4 lg:mt-0">
                    <a href="./index.html" className="inline-block px-5 py-3.5 border border-dashed border-black rounded-lg font-mono text-xs text-textDark hover:bg-gray-100 transition [border-style:dashed] [border-width:2px] [border-dasharray:5_5]">Home</a>
                    <a href="#" className="px-5 py-3.5 border border-textDark rounded-lg font-mono text-xs bg-textDark text-white hover:bg-[#2b1b17] transition">Seller Mode</a>
                </div>

                <a href="#" className="absolute left-1/2 transform -translate-x-1/2 top-4 lg:static lg:transform-none lg:order-2">
                    <img src={logo} alt="Style Loom Logo" className="h-8" />
                </a>

                <div className="flex items-center gap-4 order-1 lg:order-3 ml-auto lg:ml-0">
                    <a href="./wishlist.html" className="w-[46px] h-[46px] bg-[#1a1a1a] rounded-lg flex justify-center items-center hover:bg-[#2b1b17] transition">
                        <img src={wishlistIcon} alt="Wishlist" />
                    </a>
                    <a href="./profile.html" className="px-8 py-3.5 bg-primary text-white rounded-lg font-mono text-xs font-medium hover:bg-[#543b32] transition">Sign Up</a>
                </div>
            </div>
        </header>
    );
};

export default Header;
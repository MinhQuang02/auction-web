import gamepadImg from '../../../assets/images/_gamepadImg.png';
import jacketImg from '../../../assets/images/_gamepadImg.png';

const MyPurchases = () => {
    const products = [
        {
            id: 1,
            title: 'GP11 Shooter USB Gamepad',
            image: gamepadImg,
            price: '$550',
        },
        {
            id: 2,
            title: 'Quilted Satin Jacket',
            image: jacketImg,
            price: '$750',
        },
        {
            id: 3,
            title: 'GP11 Shooter USB Gamepad',
            image: gamepadImg,
            price: '$550',
        },
        {
            id: 4,
            title: 'Quilted Satin Jacket',
            image: jacketImg,
            price: '$750',
        },
        {
            id: 5,
            title: 'GP11 Shooter USB Gamepad',
            image: gamepadImg,
            price: '$550',
        },
        {
            id: 6,
            title: 'Quilted Satin Jacket',
            image: jacketImg,
            price: '$750',
        },
        {
            id: 7,
            title: 'GP11 Shooter USB Gamepad',
            image: gamepadImg,
            price: '$550',
        },
        {
            id: 8,
            title: 'Quilted Satin Jacket',
            image: jacketImg,
            price: '$750',
        },
    ];

    return (
        <section id="my-purchases" className="container mx-auto px-4 md:px-10 lg:px-32 xl:px-40 py-16 font-poppins text-[#1f1f1f]">    
            <div className="flex-grow w-full">
                
                {/* --- Header & Controls --- */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                    <h2 className="text-xl font-medium text-black">My Purchases ({products.length})</h2>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {/* Search Input */}
                        <div className="relative flex-grow md:flex-grow-0">
                            <input 
                                type="text" 
                                placeholder="Search product" 
                                className="bg-[#F5F5F5] rounded pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 w-full md:w-[300px] placeholder-gray-400"
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                        </div>

                        {/* View Toggle Buttons */}
                        <button className="p-2.5 rounded hover:bg-gray-100 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-gray-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        </button>
                        <button className="p-2.5 rounded bg-[#EAEAEA] hover:bg-gray-200 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-black">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* --- Product Grid --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {products.map((product) => (
                        <div key={product.id} className="group flex flex-col gap-3">
                            {/* Image Container */}
                            <div className="relative bg-[#F5F5F5] rounded h-[250px] flex items-center justify-center overflow-hidden">
                                
                                {/* Trash / Remove Icon */}
                                <div className="absolute top-3 right-3 flex flex-col gap-2">
                                    <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200 transition text-gray-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.247-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.287 9.463 4.108 9 4.869 9a.76.76 0 01.437.149c.53.35.873.94.918 1.571.045.646.22 1.269.516 1.842M10.5 14.25h-6" />
                                        </svg>
                                    </button>
                                    <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200 transition text-gray-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398C20.713 14.537 19.892 15 19.131 15a.76.76 0 01-.437-.149c-.53-.35-.873-.94-.918-1.571A48.32 48.32 0 0119.5 11.25c.09-.363.154-.73.19-1.1M3.75 18h16.5" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 13.5c-.806 0-1.533.446-2.031 1.08a9.04 9.04 0 01-2.861 2.4c-.723.384-1.35.956-1.653 1.715a4.498 4.498 0 00-.322 1.672V21a.75.75 0 01-.75.75 2.25 2.25 0 01-2.25-2.25c0-1.152.26-2.247.723-3.218.266-.558-.107-1.282-.725-1.282H4.256c-1.026 0-1.945-.694-2.054-1.715a11.95 11.95 0 012.649-7.521c.388-.482.987-.729 1.605-.729H7.52c.483 0 .964.078 1.423.23l3.114 1.04a4.501 4.501 0 001.423.23h1.294M7.5 15h-6" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Product Image */}
                                <img src={product.image} alt={product.title} className="w-[160px] object-contain drop-shadow-lg" />
                                
                                {/* Pay Now Button Overlay */}
                                <button className="absolute bottom-0 w-full bg-black text-white py-2 text-sm font-medium hover:bg-gray-800 transition">
                                    Pay Now
                                </button>
                            </div>

                            {/* Product Info */}
                            <div>
                                <h3 className="font-bold text-base mb-1 truncate" title={product.title}>{product.title}</h3>
                                <div className="flex gap-2 text-sm mb-2">
                                    <span className="text-[#AE9B84] font-medium">{product.price}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- Pagination --- */}
                <div className="flex justify-center gap-3 mt-12 text-sm text-gray-600 items-center">
                    <button className="flex items-center gap-1 hover:text-black transition">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Previous
                    </button>
                    
                    <div className="flex items-center gap-2">
                        <button className="w-8 h-8 bg-[#AE9B84] text-white rounded flex items-center justify-center">1</button>
                        <button className="w-8 h-8 hover:bg-gray-200 rounded flex items-center justify-center">2</button>
                        <button className="w-8 h-8 hover:bg-gray-200 rounded flex items-center justify-center">3</button>
                        <span className="w-8 h-8 flex items-center justify-center">...</span>
                        <button className="w-8 h-8 hover:bg-gray-200 rounded flex items-center justify-center">67</button>
                        <button className="w-8 h-8 hover:bg-gray-200 rounded flex items-center justify-center">68</button>
                    </div>

                    <button className="flex items-center gap-1 hover:text-black transition">
                        Next
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </button>
                </div>

            </div>
        </section>
    );
};

export default MyPurchases;
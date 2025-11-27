const AuctionHistory = () => {
    const historyData = [
        { id: 1, time: '27/10/2025 10:43', bidder: '****Khoa', price: '6,000,000$' },
        { id: 2, time: '27/10/2025 9:43', bidder: '****Kha', price: '5,900,000$' },
        { id: 3, time: '27/10/2025 8:43', bidder: '****Tuấn', price: '5,800,000$' },
        { id: 4, time: '27/10/2025 7:43', bidder: '****Khánh', price: '5,700,000$' },
        { id: 5, time: '27/11/2025 7:47', bidder: '****Minh', price: '6,700,000$' },
    ];

    return (
        <section id="auction-history" className="container mx-auto px-5 lg:px-12 py-16 font-sans text-[#1f1f1f]">
            
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 tracking-wide">Auction History</h2>

            <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
                
                {/* Table Header */}
                <div className="grid grid-cols-3 bg-[#E0E0E0] py-4 px-6 font-bold text-base md:text-lg text-black">
                    <div>Time Start</div>
                    <div>Bidders</div>
                    <div>Prices</div>
                </div>

                {/* Table Body */}
                <div className="flex flex-col text-sm md:text-base text-gray-600">
                    {historyData.map((item, index) => {
                        // Logic màu nền xen kẽ: Chẵn là xám, Lẻ là trắng
                        const rowBgClass = index % 2 === 0 ? 'bg-[#F5F5F5]' : 'bg-white';

                        return (
                            <div 
                                key={item.id} 
                                className={`grid grid-cols-3 py-4 px-6 border-b border-gray-100 hover:bg-gray-200 transition ${rowBgClass}`}
                            >
                                <div>{item.time}</div>
                                <div>{item.bidder}</div>
                                <div>{item.price}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default AuctionHistory;
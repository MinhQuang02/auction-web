import deliveryIcon from '../../../assets/images/I3_1151_120_1519_120_1452_120_1380.svg';
import serviceIcon from '../../../assets/images/I3_1151_120_1537_120_1465_120_1428.svg';
import guaranteeIcon from '../../../assets/images/I3_1151_226_5016_120_1495_120_1442_120_1752.svg';

const Services = () => {
    const serviceList = [
        {
            id: 1,
            icon: deliveryIcon,
            title: 'FREE AND FAST DELIVERY',
            description: 'Free delivery for all orders over $140',
        },
        {
            id: 2,
            icon: serviceIcon,
            title: '24/7 CUSTOMER SERVICE',
            description: 'Friendly 24/7 customer support',
        },
        {
            id: 3,
            icon: guaranteeIcon,
            title: 'MONEY BACK GUARANTEE',
            description: 'We return money within 30 days',
        },
    ];

    return (
        <section id="services" className="container mx-auto px-5 lg:px-12 py-32 relative">
            <div className="flex flex-wrap justify-center gap-20">
                {serviceList.map((service) => (
                    <div key={service.id} className="flex flex-col items-center text-center max-w-[260px]">
                        {/* Icon Circle Container */}
                        <div className="w-20 h-20 rounded-full bg-[#c1c1c1] flex justify-center items-center mb-6 border-[10px] border-[#2F2E30]/10 transition-transform duration-300 hover:scale-110">
                            <img src={service.icon} alt={service.title} className="w-10" />
                        </div>
                        
                        {/* Text Content */}
                        <h3 className="font-semibold text-xl mb-2 uppercase">{service.title}</h3>
                        <p className="text-sm">{service.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Services;
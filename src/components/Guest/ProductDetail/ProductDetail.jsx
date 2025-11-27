import Sidebar from '../Sidebar';
import Product from './Product';
import AuctionHistory from './AuctionHistory';
import AskSeller from './AskSeller';
import RelatedItems from './RelatedItems';


function ProductDetail() {
  return (
    <>
      <section id="hero" className="container mx-auto px-5 lg:px-12 py-10 flex flex-col lg:flex-row gap-10">
        <Sidebar />
        <Product />
      </section>
      <AuctionHistory />
      <AskSeller />
      <RelatedItems />
    </>
  )
}

export default ProductDetail;

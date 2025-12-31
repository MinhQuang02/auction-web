import Sidebar from "../../components/Sidebar";
import Product from "./Product";
import AuctionHistory from "./AuctionHistory";
import AskSeller from "./AskSeller";
import RelatedItems from "./RelatedItems";
import { useAuth } from "@context/AuthContext";

function ProductDetail() {
  const { isAuthenticated } = useAuth();
  return (
    <>
      <section
        id="hero"
        className="container mx-auto px-5 lg:px-12 py-10 flex flex-col lg:flex-row gap-10"
      >
        <Sidebar />
        <Product />
      </section>
      {isAuthenticated && <AuctionHistory />}
      <AskSeller />
      <RelatedItems />
    </>
  );
}

export default ProductDetail;

import Header from './components/Header';
import Footer from './components/Footer';
import BackToTopButton from './components/BackToTop';
import HomePage from './components/Guest/HomePage/HomePage';
import CategoryPage from './components/Guest/CategoryPage/CategoryPage';
import ProductDetail from './components/Guest/ProductDetail/ProductDetail';
import Profiles from './components/Bidder/Profiles/Profiles';
import Review from './components/Bidder/Review/Review';
import Wishlists from './components/Bidder/Wishlists/Wishlists';
import AuctionProducts from './components/Bidder/AuctionProducts/AuctionProducts';
import MyPurchases from './components/Bidder/MyPurchases/MyPurchases';
import BillingDetails from './components/Bidder/BillingDetails/BillingDetails';

function App() {
  return (
    <body className="font-sans text-textDark antialiased relative">
      <Header />
      <HomePage />
      <Footer />
      <BackToTopButton />
    </body>
  )
}

export default App

import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';

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
import NotFound from './components/NotFound';

import Login from './components/Auth/Login'; 
import Signup from './components/Auth/Signup';
import ForgotPassword from './components/Auth/ForgotPassword';

const MainLayout = () => {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
      <BackToTopButton />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <div className="font-sans text-textDark antialiased relative">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/category" element={<CategoryPage />} />
            <Route path="/product" element={<ProductDetail />} />
            
            <Route path="/profile" element={<Profiles />} />
            <Route path="/reviews" element={<Review />} />
            <Route path="/wishlist" element={<Wishlists />} />
            <Route path="/auctions" element={<AuctionProducts />} />
            <Route path="/my-purchases" element={<MyPurchases />} />
            <Route path="/billing" element={<BillingDetails />} />
            
            <Route path="*" element={<NotFound />} />
          </Route>

        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
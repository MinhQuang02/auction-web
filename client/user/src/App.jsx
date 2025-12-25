import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";

import Header from "@shared/components/Header";
import Footer from "@shared/components/Footer";
import BackToTopButton from "@shared/components/BackToTop";
import NotFound from "@shared/pages/NotFound";

import HomePage from "@guest/pages/HomePage/HomePage";
import CategoryPage from "@guest/pages/CategoryPage/CategoryPage";
import ProductDetail from "@guest/pages/ProductDetail/ProductDetail";

import Profiles from "@bidder/pages/Profiles/Profiles";
import Review from "@bidder/pages/Review/Review";
import Wishlists from "@bidder/pages/Wishlists/Wishlists";
import AuctionProducts from "@bidder/pages/AuctionProducts/AuctionProducts";
import MyPurchases from "@bidder/pages/MyPurchases/MyPurchases";
import BillingDetails from "@bidder/pages/BillingDetails/BillingDetails";

import MyProducts from "@seller/pages/MyProducts/MyProducts";
import EditProduct from "@seller/pages/EditProduct/EditProduct";

import Login from "@shared/pages/auth/Login";
import Signup from "@shared/pages/auth/Signup";
import ForgotPassword from "@shared/pages/auth/ForgotPassword";

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

const SellerLayout = () => {
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
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomePage />} />
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

          <Route element={<SellerLayout />}>
            <Route
              path="/seller"
              element={<Navigate to="/seller/products" replace />}
            />
            <Route path="/seller/products" element={<MyProducts />} />
            <Route path="/seller/edit-product" element={<EditProduct />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

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

import AdminDashboard from "@admin/pages/AdminDashboard/AdminDashboard";
import CategoryManagement from "@admin/pages/CategoryManagement/CategoryManagement";
import AuctionManagement from "@admin/pages/AuctionManagement/AuctionManagement";
import UserManagement from "@admin/pages/UserManagement/UserManagement";

import Login from "@shared/pages/auth/Login";
import Signup from "@shared/pages/auth/Signup";
import ForgotPassword from "@shared/pages/auth/ForgotPassword";

const AdminLayout = () => {
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

          <Route element={<AdminLayout />}>
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/categories" element={<CategoryManagement />} />
            <Route path="/admin/auctions" element={<AuctionManagement />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

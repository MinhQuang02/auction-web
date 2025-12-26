import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTopButton from "@/components/BackToTop";
import NotFound from "@/pages/NotFound";

import AdminDashboard from "@/pages/AdminDashboard/AdminDashboard";
import CategoryManagement from "@/pages/CategoryManagement/CategoryManagement";
import AuctionManagement from "@/pages/AuctionManagement/AuctionManagement";
import UserManagement from "@/pages/UserManagement/UserManagement";

import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import ForgotPassword from "@/pages/auth/ForgotPassword";

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
            <Route
              path="/"
              element={<Navigate to="/admin/dashboard" replace />}
            />
            <Route
              path="/admin"
              element={<Navigate to="/admin/dashboard" replace />}
            />
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

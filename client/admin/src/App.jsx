import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";

import Header from "@components/Header";
import Footer from "@components/Footer";
import BackToTopButton from "@components/BackToTop";
import NotFound from "@pages/NotFound";

import AdminDashboard from "@pages/AdminDashboard/AdminDashboard";
import CategoryManagement from "@pages/CategoryManagement/CategoryManagement";
import AuctionManagement from "@pages/AuctionManagement/AuctionManagement";
import UserManagement from "@pages/UserManagement/UserManagement";

import Login from "@pages/auth/Login";
import ForgotPassword from "@pages/auth/ForgotPassword";

import RoleRoute from "@routes/RoleRoute";
import PublicOnlyRoute from "@routes/PublicOnlyRoute";

const AdminLayout = () => (
  <>
    <Header />
    <main className="min-h-screen">
      <Outlet />
    </main>
    <Footer />
    <BackToTopButton />
  </>
);

function App() {
  return (
    <BrowserRouter>
      <div className="font-sans text-textDark antialiased relative">
        <Routes>
          {/* Login / Forgot password */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Admin routes */}
          <Route element={<RoleRoute allowedRoles={["admin"]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<Navigate to="/categories" replace />} />
              <Route
                path="/admin"
                element={<Navigate to="/categories" replace />}
              />
              {/* <Route path="/dashboard" element={<AdminDashboard />} /> */}
              <Route path="/categories" element={<CategoryManagement />} />
              <Route path="/auctions" element={<AuctionManagement />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

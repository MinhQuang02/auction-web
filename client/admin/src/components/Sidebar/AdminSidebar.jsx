import React from "react";
import Sidebar from "./Sidebar";

const adminScreens = [
  // { name: "Dashboard", to: "/dashboard" },
  { name: "Categories", to: "/categories" },
  { name: "Auctions", to: "/auctions" },
  { name: "Users", to: "/users" },
];

const AdminSidebar = () => {
  return <Sidebar showSearchBar={false} items={adminScreens} />;
};

export default AdminSidebar;

import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const Layout = () => {
  // Mock user data - replace with actual user data from authentication context
  const user = {
    name: "User"
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar user={user} />
      <Outlet />
    </div>
  );
};

export default Layout;

// src/components/layouts/Topbar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import logo from "../../Assets/layouts/1LOGO.png";

export default function Topbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="w-full bg-white border-b border-gray-200 shadow-sm h-16">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-full">
        {/* Left: Logo */}
        <div className="flex items-center flex-shrink-0">
          <img
            src={logo}
            alt="ARDU Logo"
            className="h-10 w-auto object-contain"
          />
        </div>

        {/* Center: Tabs */}
        <div className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
          <Link
            to="/feed"
            className={`text-sm font-medium transition-all py-2 ${
              isActive("/feed")
                ? "text-red-700 border-b-2 border-red-700"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            For You
          </Link>

          <Link
            to="/community"
            className={`text-sm font-medium transition-all py-2 ${
              isActive("/community")
                ? "text-red-700 border-b-2 border-red-700"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Community
          </Link>
        </div>

        {/* Right: Upload Button */}
        <Link
          to="/upload"
          className="bg-red-700 text-white p-2 rounded-full flex items-center justify-center hover:bg-red-800 transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
        </Link>
      </div>
    </nav>
  );
}

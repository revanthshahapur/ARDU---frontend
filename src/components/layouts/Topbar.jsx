// src/components/layouts/Topbar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import logo from "../../Assets/layouts/1LOGO.png";

export default function Topbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="w-full bg-white border-b border-gray-200 shadow-sm flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 sticky top-0 z-50 h-16 sm:h-20">
      {/* Left: Logo */}
      <div className="flex items-center flex-shrink-0">
        <img
          src={logo}
          alt="ARDU Logo"
          className="h-12 sm:h-14 w-auto object-contain"
        />
      </div>

      {/* Center: Tabs */}
      <div className="hidden md:flex items-center gap-6 sm:gap-10 justify-center">
        <Link
          to="/feed"
          className={`text-base font-semibold transition-all ${
            isActive("/feed")
              ? "text-red-700 border-b-2 border-red-700 pb-1"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          For You
        </Link>

        <Link
          to="/community"
          className={`text-base font-semibold transition-all ${
            isActive("/community")
              ? "text-red-700 border-b-2 border-red-700 pb-1"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Community
        </Link>
      </div>

      {/* Right: Upload Button */}
      <Link
        to="/upload"
        className="bg-red-700 text-white p-2.5 sm:p-3 rounded-full flex items-center justify-center hover:bg-red-800 transition"
      >
        <Plus className="w-5 h-5" />
      </Link>
    </nav>
  );
}

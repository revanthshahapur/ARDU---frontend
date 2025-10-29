// src/components/layouts/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Bell,
  ClipboardCheck,
  Building,
  Megaphone,
  User,
} from "lucide-react";
import { useAuth } from "../../features/Auth/AuthContext";

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const isAdmin =
    !!(
      user?.mainAdmin ||
      String(user?.role || "").toUpperCase().includes("ADMIN")
    );

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { to: "/feed", label: "Home", icon: Home },
    { to: "/members", label: "Members", icon: Users },
    ...(isAdmin
      ? [{ to: "/accept-posts", label: "Accept Posts", icon: ClipboardCheck }]
      : [{ to: "/announcements", label: "Announcements", icon: Megaphone }]),
    { to: "/profile", label: "Profile", icon: User },
    { to: "/org", label: "Org", icon: Building },
  ];

  return (
    <>
      {/* ===== Desktop Sidebar ===== */}
      <aside className="hidden md:flex flex-col bg-white border-r border-gray-200 w-56 h-screen py-6 px-3 fixed left-0 top-0 z-20">
        <div className="flex flex-col items-center mb-8">
          <img
            src="/logo.png"
            alt="ARDU Logo"
            className="h-16 mb-2 object-contain"
          />
        </div>
        <nav className="flex flex-col space-y-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm transition-all ${
                isActive(to)
                  ? "bg-[#fde8e8] text-[#B41E1E]" // deep red active
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* ===== Mobile Bottom Navigation ===== */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-center py-2 shadow-lg z-50 rounded-t-2xl">
        {navItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center text-xs font-medium transition-all ${
              isActive(to)
                ? "text-[#B41E1E]"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Icon
              className={`w-5 h-5 mb-0.5 ${
                isActive(to) ? "text-[#B41E1E]" : ""
              }`}
            />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}

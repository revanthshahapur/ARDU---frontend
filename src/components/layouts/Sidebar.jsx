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
      {/* ===== Desktop Sidebar (WIDTH FIX: w-56 changed to w-64) ===== */}
      <div className="hidden md:flex flex-col bg-white border-r border-gray-200 w-64 h-full">
        <div className="p-4">
          <nav className="flex flex-col space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  isActive(to)
                    ? "bg-red-50 text-red-700 border-l-4 border-red-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* ===== Mobile Bottom Navigation (no change) ===== */}
      <nav className="md:hidden bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around items-center py-2 px-2">
          {navItems.slice(0, 5).map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all min-w-0 flex-1 ${
                isActive(to)
                  ? "text-red-700 bg-red-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="w-5 h-5 mb-1 flex-shrink-0" />
              <span className="text-xs font-medium truncate">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
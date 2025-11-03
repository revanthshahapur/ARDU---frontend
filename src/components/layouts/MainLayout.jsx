// src/components/layouts/MainLayout.jsx
import React from "react";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";

export default function MainLayout({ children }) {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* ===== Fixed Topbar (Standardized to h-20) ===== */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm h-20">
        <Topbar />
      </header>

      {/* ===== Desktop Sidebar (Starts below h-20) ===== */}
      {/* NO W-XX CLASS HERE. Sidebar.jsx defines its own width (w-56) */}
      <aside className="hidden md:block fixed left-0 top-20 h-[calc(100vh-5rem)] z-40">
        <Sidebar />
      </aside>

      {/* ===== Main Content Area (pt-20 matches header, ml-56 MATCHES ORIGINAL w-56 sidebar) ===== */}
      <main className="pt-20 md:ml-56 min-h-screen pb-20 md:pb-4">
        <div className="px-4 sm:px-6 lg:px-8 py-4 mt-0">
          {children}
        </div>
      </main>

      {/* ===== Mobile Bottom Navigation (No change) ===== */}
      <div className="md:hidden fixed bottom-0 left-0 w-full z-50">
        <Sidebar />
      </div>
    </div>
  );
}
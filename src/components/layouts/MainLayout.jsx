// src/components/layouts/MainLayout.jsx
import React from "react";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";

export default function MainLayout({ children }) {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* ===== Fixed Topbar ===== */}
      <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-sm">
        <Topbar />
      </header>

      <div className="flex flex-1 pt-16 md:pt-0">
        {/* ===== Desktop Sidebar ===== */}
        <aside className="hidden md:block fixed h-full">
          <Sidebar />
        </aside>

        {/* ===== Main Content Area ===== */}
        <main className="flex-1 w-full md:ml-56 px-3 sm:px-6 mt-2 pb-20 md:pb-0 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* ===== Mobile Bottom Navigation ===== */}
      <div className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-white border-t border-gray-200 shadow-sm">
        <Sidebar />
      </div>
    </div>
  );
}

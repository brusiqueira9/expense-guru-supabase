import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";

export default function RootLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
} 
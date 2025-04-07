import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { UserNav } from "./UserNav";

export function RootLayout() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="h-16 border-b bg-card flex items-center justify-end px-6">
          <UserNav />
        </div>
        <div className="container mx-auto py-6 px-4 md:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
} 
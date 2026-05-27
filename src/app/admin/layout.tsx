"use client";

import { useState } from "react";
import { AdminSidebar, AdminHeader, AdminMobileNav, AdminMobileMenu } from "@/components/admin/layout";
import { ToastProvider } from "@/components/admin/ui/AdminToast";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-dark">
        {/* Desktop Sidebar */}
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Mobile Menu */}
        <AdminMobileMenu
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        {/* Main Content */}
        <div
          className={`transition-all duration-300 ${
            sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
          }`}
        >
          {/* Header */}
          <AdminHeader onMenuClick={() => setMobileMenuOpen(true)} />

          {/* Page Content */}
          <main className="p-4 lg:p-6 pb-20 lg:pb-6">{children}</main>
        </div>

        {/* Mobile Bottom Nav */}
        <AdminMobileNav />
      </div>
    </ToastProvider>
  );
}

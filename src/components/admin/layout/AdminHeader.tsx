"use client";

import { useRouter } from "next/navigation";
import AdminButton from "../ui/AdminButton";

interface AdminHeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

export default function AdminHeader({ title, onMenuClick }: AdminHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Clear the auth cookie by calling a logout endpoint or letting it expire
      // For now, redirect to login which will clear the session
      document.cookie = "team-fund-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-dark/95 backdrop-blur-sm border-b border-white/10">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        {/* Left side - Menu button (mobile) and title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {title && (
            <h1 className="font-headline text-xl uppercase tracking-tight text-white">
              {title}
            </h1>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          <AdminButton variant="ghost" size="sm" onClick={handleLogout}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </AdminButton>
        </div>
      </div>
    </header>
  );
}

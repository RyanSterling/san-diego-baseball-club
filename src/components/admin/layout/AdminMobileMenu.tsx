"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Games", href: "/admin/games" },
  { label: "Players", href: "/admin/players" },
  { label: "Seasons", href: "/admin/seasons" },
  { label: "Practices", href: "/admin/practices" },
  { label: "Team Fund", href: "/admin/fund" },
  { label: "Settings", href: "/admin/settings" },
  { label: "Stats Entry", href: "/admin/stats-entry" },
];

interface AdminMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminMobileMenu({
  isOpen,
  onClose,
}: AdminMobileMenuProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Menu */}
      <div className="fixed inset-y-0 left-0 w-64 bg-dark border-r border-white/10 z-50 lg:hidden">
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          <span className="font-headline text-xl uppercase tracking-tight text-white">
            SD <span className="text-teal">Admin</span>
          </span>
          <button
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`block px-4 py-3 rounded-lg transition-colors ${
                isActive(item.href)
                  ? "bg-teal text-dark"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="font-headline text-sm uppercase tracking-wide">
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2 text-white/50 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            <span className="text-sm">View Site</span>
          </Link>
        </div>
      </div>
    </>
  );
}

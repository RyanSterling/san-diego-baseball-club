"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#schedule", label: "Schedule" },
  { href: "/practice", label: "Practice" },
  { href: "/#roster", label: "Roster" },
  { href: "/stats", label: "Stats" },
  { href: "/#contact", label: "Contact" },
];

export default function Nav() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav>
      {/* Desktop nav */}
      <ul className="hidden md:flex space-x-8">
        {navLinks.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`relative py-2 transition-colors ${
                pathname === link.href && !link.href.includes("#")
                  ? "text-white font-semibold before:absolute before:bottom-1.5 before:left-0 before:right-0 before:h-0.5 before:bg-orange after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-pink"
                  : "text-white/70 hover:text-teal"
              }`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Mobile menu button */}
      <button
        className="md:hidden p-2 hover:text-teal transition-colors"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {mobileMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile nav */}
      {mobileMenuOpen && (
        <div className="absolute top-14 left-0 right-0 bg-dark border-t border-teal/20 md:hidden z-50">
          <ul className="px-4 py-2 space-y-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`block py-3 transition-colors ${
                    pathname === link.href && !link.href.includes("#")
                      ? "text-teal font-semibold"
                      : "text-white/70 hover:text-teal"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}

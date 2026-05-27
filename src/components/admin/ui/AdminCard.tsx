"use client";

import { ReactNode } from "react";

interface AdminCardProps {
  children: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

export default function AdminCard({
  children,
  title,
  description,
  actions,
  className = "",
  padding = "md",
}: AdminCardProps) {
  const paddingStyles = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={`bg-white/5 border border-white/10 rounded-xl ${className}`}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            {title && (
              <h3 className="font-headline text-lg uppercase tracking-tight text-white">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-white/50 text-sm mt-0.5">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={paddingStyles[padding]}>{children}</div>
    </div>
  );
}

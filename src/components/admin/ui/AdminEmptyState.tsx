"use client";

import { ReactNode } from "react";
import AdminButton from "./AdminButton";

interface AdminEmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function AdminEmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: AdminEmptyStateProps) {
  return (
    <div className="bg-white/5 border border-white/10 border-dashed rounded-xl p-8 text-center">
      {icon && (
        <div className="w-12 h-12 mx-auto mb-4 text-white/30">{icon}</div>
      )}
      <h3 className="font-headline text-lg uppercase tracking-tight text-white mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-white/50 text-sm mb-4">{description}</p>
      )}
      {actionLabel && onAction && (
        <AdminButton onClick={onAction}>{actionLabel}</AdminButton>
      )}
    </div>
  );
}

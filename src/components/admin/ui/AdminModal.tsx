"use client";

import { ReactNode, useEffect, useCallback } from "react";
import AdminButton from "./AdminButton";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
  loading?: boolean;
  children?: ReactNode;
}

export default function AdminModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading = false,
  children,
}: AdminModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    },
    [onClose, loading]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => !loading && onClose()}
      />

      {/* Modal */}
      <div className="relative bg-dark border border-white/10 rounded-xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="font-headline text-xl uppercase tracking-tight text-white">
            {title}
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {message && <p className="text-white/70">{message}</p>}
          {children}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
          <AdminButton
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </AdminButton>
          {onConfirm && (
            <AdminButton
              variant={variant === "danger" ? "danger" : "primary"}
              onClick={onConfirm}
              loading={loading}
            >
              {confirmLabel}
            </AdminButton>
          )}
        </div>
      </div>
    </div>
  );
}

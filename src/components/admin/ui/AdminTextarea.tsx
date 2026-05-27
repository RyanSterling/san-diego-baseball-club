"use client";

import { TextareaHTMLAttributes, forwardRef } from "react";

interface AdminTextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  label?: string;
  error?: string;
  onChange?: (value: string) => void;
}

const AdminTextarea = forwardRef<HTMLTextAreaElement, AdminTextareaProps>(
  ({ label, error, onChange, className = "", id, ...props }, ref) => {
    const textareaId = id || props.name || Math.random().toString(36).slice(2);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-headline uppercase tracking-wide text-white/70 mb-2"
          >
            {label}
            {props.required && <span className="text-pink ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full bg-white/5 border text-white px-4 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal/20 placeholder:text-white/30 resize-y min-h-[100px] ${
            error
              ? "border-pink focus:border-pink"
              : "border-white/20 focus:border-teal"
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-pink">{error}</p>}
      </div>
    );
  }
);

AdminTextarea.displayName = "AdminTextarea";

export default AdminTextarea;

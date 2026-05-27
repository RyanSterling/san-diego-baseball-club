"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface AdminInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label?: string;
  error?: string;
  onChange?: (value: string) => void;
}

const AdminInput = forwardRef<HTMLInputElement, AdminInputProps>(
  ({ label, error, onChange, className = "", id, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).slice(2);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-headline uppercase tracking-wide text-white/70 mb-2"
          >
            {label}
            {props.required && <span className="text-pink ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full bg-white/5 border text-white px-4 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal/20 placeholder:text-white/30 ${
            error
              ? "border-pink focus:border-pink"
              : "border-white/20 focus:border-teal"
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-pink">{error}</p>
        )}
      </div>
    );
  }
);

AdminInput.displayName = "AdminInput";

export default AdminInput;

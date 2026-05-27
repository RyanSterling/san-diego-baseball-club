"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface AdminCheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "type"> {
  label: string;
  description?: string;
  onChange?: (checked: boolean) => void;
}

const AdminCheckbox = forwardRef<HTMLInputElement, AdminCheckboxProps>(
  ({ label, description, onChange, className = "", id, checked, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).slice(2);

    return (
      <label
        htmlFor={inputId}
        className={`flex items-start gap-3 cursor-pointer group ${className}`}
      >
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange?.(e.target.checked)}
            className="peer sr-only"
            {...props}
          />
          <div
            className={`w-5 h-5 border-2 rounded transition-colors ${
              checked
                ? "bg-teal border-teal"
                : "bg-white/5 border-white/30 group-hover:border-white/50"
            }`}
          >
            {checked && (
              <svg
                className="w-full h-full text-dark"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>
        <div className="flex-1">
          <span className="text-white font-medium">{label}</span>
          {description && (
            <p className="text-white/50 text-sm mt-0.5">{description}</p>
          )}
        </div>
      </label>
    );
  }
);

AdminCheckbox.displayName = "AdminCheckbox";

export default AdminCheckbox;

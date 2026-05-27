"use client";

import { SelectHTMLAttributes, forwardRef } from "react";

interface AdminSelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  onChange?: (value: string) => void;
}

const AdminSelect = forwardRef<HTMLSelectElement, AdminSelectProps>(
  (
    {
      label,
      error,
      options,
      placeholder,
      onChange,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || props.name || Math.random().toString(36).slice(2);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-headline uppercase tracking-wide text-white/70 mb-2"
          >
            {label}
            {props.required && <span className="text-pink ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          onChange={(e) => onChange?.(e.target.value)}
          className={`w-full bg-white/5 border text-white px-4 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal/20 ${
            error
              ? "border-pink focus:border-pink"
              : "border-white/20 focus:border-teal"
          } ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" className="bg-dark">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-dark">
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-pink">{error}</p>}
      </div>
    );
  }
);

AdminSelect.displayName = "AdminSelect";

export default AdminSelect;

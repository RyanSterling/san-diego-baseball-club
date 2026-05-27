"use client";

import { useState, useCallback, useRef } from "react";
import AdminButton from "./AdminButton";

interface AdminImageUploadProps {
  label?: string;
  value?: string | null;
  onChange: (file: File | null, preview: string | null) => void;
  error?: string;
  accept?: string;
  maxSize?: number; // in MB
}

export default function AdminImageUpload({
  label,
  value,
  onChange,
  error,
  accept = "image/*",
  maxSize = 5,
}: AdminImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File size must be less than ${maxSize}MB`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
        onChange(file, result);
      };
      reader.readAsDataURL(file);
    },
    [maxSize, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleRemove = useCallback(() => {
    setPreview(null);
    onChange(null, null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [onChange]);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-headline uppercase tracking-wide text-white/70 mb-2">
          {label}
        </label>
      )}

      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Preview"
            className="max-h-48 rounded-lg border border-white/20"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 w-6 h-6 bg-pink text-white rounded-full flex items-center justify-center hover:bg-pink/80 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragActive
              ? "border-teal bg-teal/5"
              : error
              ? "border-pink/50 hover:border-pink"
              : "border-white/20 hover:border-teal/50"
          }`}
        >
          <svg
            className="w-10 h-10 mx-auto mb-3 text-white/30"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-white/50 text-sm">
            Drop image here or{" "}
            <span className="text-teal">click to upload</span>
          </p>
          <p className="text-white/30 text-xs mt-1">
            Max size: {maxSize}MB
          </p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {error && <p className="mt-1 text-sm text-pink">{error}</p>}
    </div>
  );
}

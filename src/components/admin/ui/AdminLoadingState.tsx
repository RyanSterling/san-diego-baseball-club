"use client";

interface AdminLoadingStateProps {
  variant?: "card" | "table" | "form" | "page";
  rows?: number;
}

export default function AdminLoadingState({
  variant = "card",
  rows = 3,
}: AdminLoadingStateProps) {
  if (variant === "page") {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-white/10 rounded w-1/4" />
        <div className="h-4 bg-white/10 rounded w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-white/5 border border-white/10 rounded-xl" />
          ))}
        </div>
        <div className="h-64 bg-white/5 border border-white/10 rounded-xl mt-8" />
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden animate-pulse">
        <div className="h-12 bg-white/10" />
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-16 border-t border-white/5 flex items-center px-6 gap-4"
          >
            <div className="h-4 bg-white/10 rounded w-1/4" />
            <div className="h-4 bg-white/10 rounded w-1/3" />
            <div className="h-4 bg-white/10 rounded w-1/6" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "form") {
    return (
      <div className="animate-pulse space-y-6">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i}>
            <div className="h-4 bg-white/10 rounded w-1/6 mb-2" />
            <div className="h-12 bg-white/5 border border-white/10 rounded-lg" />
          </div>
        ))}
        <div className="h-10 bg-white/10 rounded-lg w-32" />
      </div>
    );
  }

  // Default: card
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 animate-pulse">
      <div className="h-6 bg-white/10 rounded w-1/3 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-4 bg-white/10 rounded" style={{ width: `${80 - i * 15}%` }} />
        ))}
      </div>
    </div>
  );
}

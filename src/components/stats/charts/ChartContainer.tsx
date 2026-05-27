"use client";

import { ResponsiveContainer } from "recharts";

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  height?: number;
  children: React.ReactNode;
  className?: string;
}

export function ChartContainer({
  title,
  subtitle,
  height = 300,
  children,
  className = "",
}: ChartContainerProps) {
  return (
    <div className={`bg-white/5 border border-white/10 p-4 sm:p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="font-headline text-lg uppercase tracking-tight text-white">
          {title}
        </h3>
        {subtitle && (
          <p className="text-white/50 text-sm mt-1">{subtitle}</p>
        )}
      </div>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

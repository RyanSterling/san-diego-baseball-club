import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "dark" | "teal" | "orange" | "pink" | "win" | "loss" | "tie";
  size?: "sm" | "md";
}

const variantClasses = {
  dark: "bg-dark text-white",
  teal: "bg-teal/10 text-teal",
  orange: "bg-orange/10 text-orange",
  pink: "bg-pink/10 text-pink",
  win: "bg-win/10 text-win",
  loss: "bg-loss/10 text-loss",
  tie: "bg-tie/10 text-tie",
};

const sizeClasses = {
  sm: "text-xs px-2 py-0.5",
  md: "text-sm px-3 py-1",
};

export default function Badge({ children, variant = "dark", size = "sm" }: BadgeProps) {
  return (
    <span
      className={`inline-block font-headline uppercase tracking-wide rounded ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {children}
    </span>
  );
}

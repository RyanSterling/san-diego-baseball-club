interface TwoToneTitleProps {
  prefix: string;
  highlight: string;
  accentColor?: "orange" | "teal" | "pink";
  size?: "sm" | "md" | "lg";
  dark?: boolean;
}

const colorClasses = {
  orange: "text-orange",
  teal: "text-teal",
  pink: "text-pink",
};

const sizeClasses = {
  sm: "text-lg",
  md: "text-xl md:text-2xl",
  lg: "text-2xl md:text-3xl",
};

export default function TwoToneTitle({
  prefix,
  highlight,
  accentColor = "orange",
  size = "md",
  dark = false,
}: TwoToneTitleProps) {
  return (
    <h2 className={`font-headline uppercase tracking-tight ${sizeClasses[size]}`}>
      <span className={dark ? "text-white" : "text-dark"}>{prefix} </span>
      <span className={colorClasses[accentColor]}>{highlight}</span>
    </h2>
  );
}

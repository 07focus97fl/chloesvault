interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export default function Card({ children, className = "", style, onClick }: CardProps) {
  const Component = onClick ? "button" : "div";
  return (
    <Component
      onClick={onClick}
      style={style}
      className={`rounded-2xl border border-border bg-card p-4 ${
        onClick ? "cursor-pointer transition-colors hover:border-accent/30 active:scale-[0.98]" : ""
      } ${className}`}
    >
      {children}
    </Component>
  );
}

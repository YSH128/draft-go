import Icon from "./Icon";

const sizeStyles = {
  sm: "h-10 px-6 text-xs",
  md: "h-12 px-8 text-sm",
  lg: "h-16 px-10 text-lg",
};

export default function GoldButton({
  children,
  icon,
  size = "md",
  variant = "primary",
  className = "",
  ...props
}) {
  const baseClasses =
    "flex items-center justify-center gap-3 rounded-sm font-black transition-all hover:-translate-y-1 active:scale-95";

  const variantClasses = {
    primary:
      "bg-gold-gradient text-background-dark border border-primary-bright/30 shadow-[0_10px_30px_rgba(200,155,60,0.2)] hover:brightness-110",
    outline:
      "bg-background-dark/50 backdrop-blur-sm border border-primary/40 text-primary-bright hover:border-primary hover:bg-primary/10",
    ghost:
      "bg-transparent border border-white/20 text-white hover:bg-white/5",
  };

  return (
    <button
      className={`${baseClasses} ${sizeStyles[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon && <Icon name={icon} className="font-bold" />}
      {children}
    </button>
  );
}

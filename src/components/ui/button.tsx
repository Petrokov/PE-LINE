import { Link } from "@/lib/navigation";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ComponentProps<"button"> {
  variant?: Variant;
  size?: Size;
}

interface ButtonLinkProps extends Omit<ComponentProps<typeof Link>, "href"> {
  href: string;
  variant?: Variant;
  size?: Size;
  external?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-petrol text-white hover:bg-petrol-dark border border-petrol hover:border-petrol-dark",
  secondary:
    "bg-transparent text-petrol border border-petrol hover:bg-petrol hover:text-white",
  ghost: "bg-transparent text-ink border border-line hover:border-ink",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

const baseClasses =
  "inline-flex items-center gap-2 font-semibold transition-all duration-200 cursor-pointer select-none";

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} rounded-[10px] ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  external,
  className = "",
  children,
  ...props
}: ButtonLinkProps) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} rounded-[10px] ${className}`}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} rounded-[10px] ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}

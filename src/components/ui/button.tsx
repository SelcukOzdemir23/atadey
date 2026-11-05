import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "quiet";

/**
 * Three weights only: one primary action per screen, everything else is
 * outline or text. No `disabled:opacity` — a dimmed button loses contrast,
 * so disabled buttons stay legible and say what is happening.
 */
const VARIANTS: Record<Variant, string> = {
  primary: "bg-accent text-accent-foreground hover:bg-accent/90",
  secondary: "border border-rule bg-surface text-ink hover:border-ink/35",
  quiet: "text-ink-soft hover:text-ink"
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", className, type = "button", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded px-5 text-[0.9375rem] font-medium transition-colors duration-150",
        VARIANTS[variant],
        className
      )}
      {...props}
    />
  );
});

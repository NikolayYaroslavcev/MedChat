import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { focusRing } from "@/components/ui/styles";
import { LoadingDots } from "@/components/ui/LoadingDots";

export type ButtonVariant = "primary" | "secondary" | "ghost";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-transparent bg-primary text-surface hover:bg-primary-hover active:bg-primary-active",
  secondary:
    "border border-border bg-surface text-text hover:border-border-hover hover:bg-surface-secondary",
  ghost:
    "border border-transparent bg-transparent text-text-secondary hover:bg-surface-secondary hover:text-text",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", loading = false, disabled, className, children, ...props },
  ref,
) {
  const isDisabled = disabled || loading;
  return (
    <button
      ref={ref}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-control px-5 py-2.5 text-small font-medium",
        "transition duration-150 ease-out active:scale-[0.98]",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
        focusRing,
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {loading ? (
        <LoadingDots className={variant === "primary" ? "text-surface" : "text-text-muted"} />
      ) : (
        children
      )}
    </button>
  );
});

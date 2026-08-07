import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { focusRing } from "@/components/ui/styles";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { error = false, disabled, className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      disabled={disabled}
      aria-invalid={error || undefined}
      className={cn(
        "w-full rounded-control border bg-surface px-4 py-2.5 text-body text-text placeholder:text-text-muted",
        "transition-colors duration-150 ease-out",
        error ? "border-danger" : "border-border hover:border-border-hover",
        "disabled:cursor-not-allowed disabled:border-border disabled:bg-surface-secondary disabled:text-text-muted",
        focusRing,
        className,
      )}
      {...props}
    />
  );
});

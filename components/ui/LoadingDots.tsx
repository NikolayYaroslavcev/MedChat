import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type LoadingDotsProps = HTMLAttributes<HTMLSpanElement>;

const DOT_DELAYS = [0, 0.15, 0.3];

export function LoadingDots({ className, ...props }: LoadingDotsProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    >
      {DOT_DELAYS.map((delay) => (
        <span
          key={delay}
          aria-hidden="true"
          className="h-1.5 w-1.5 animate-loading-dot rounded-full bg-current"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
    </span>
  );
}

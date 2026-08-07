import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type CardPadding = "sm" | "md" | "lg";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
  hoverable?: boolean;
}

const paddingClasses: Record<CardPadding, string> = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({
  padding = "md",
  hoverable = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card border border-border bg-surface shadow-card transition duration-200 ease-out",
        hoverable && "hover:-translate-y-0.5 hover:shadow-card-hover",
        paddingClasses[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

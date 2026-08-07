import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type DividerProps = HTMLAttributes<HTMLDivElement>;

export function Divider({ className, ...props }: DividerProps) {
  return <div role="separator" className={cn("h-px w-full bg-border", className)} {...props} />;
}

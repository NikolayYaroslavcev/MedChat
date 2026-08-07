import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ConnectionState = "connected" | "connecting" | "disconnected";

export interface StatusIndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  status: ConnectionState;
  label?: string;
}

const statusConfig: Record<ConnectionState, { dot: string; text: string; defaultLabel: string }> = {
  connected: {
    dot: "bg-success",
    text: "text-text-secondary",
    defaultLabel: "Connected",
  },
  connecting: {
    dot: "bg-warning animate-status-pulse",
    text: "text-text-secondary",
    defaultLabel: "Connecting",
  },
  disconnected: {
    dot: "bg-neutral-400",
    text: "text-text-muted",
    defaultLabel: "Disconnected",
  },
};

export function StatusIndicator({ status, label, className, ...props }: StatusIndicatorProps) {
  const config = statusConfig[status];
  return (
    <span
      role="status"
      className={cn("inline-flex items-center gap-2 text-small", config.text, className)}
      {...props}
    >
      <span aria-hidden="true" className={cn("h-2 w-2 rounded-pill", config.dot)} />
      {label ?? config.defaultLabel}
    </span>
  );
}

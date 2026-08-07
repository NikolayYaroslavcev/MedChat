import { StatusIndicator } from "@/components/ui";
import type { ConnectionState } from "@/components/ui";

export interface ConnectionStatusProps {
  status: ConnectionState;
}

const labels: Record<ConnectionState, string> = {
  connected: "Live",
  connecting: "Reconnecting…",
  disconnected: "Offline",
};

export function ConnectionStatus({ status }: ConnectionStatusProps) {
  return <StatusIndicator status={status} label={labels[status]} />;
}

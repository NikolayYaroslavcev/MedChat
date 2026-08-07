import { ConnectionStatus } from "@/components/chat/ConnectionStatus";
import type { ConnectionState } from "@/components/ui";

export interface ChatHeaderProps {
  title: string;
  status: ConnectionState;
}

export function ChatHeader({ title, status }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-4">
      <h2 className="text-h2 text-text">{title}</h2>
      <ConnectionStatus status={status} />
    </div>
  );
}

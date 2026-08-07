import { cn } from "@/lib/utils";
import { LoadingDots } from "@/components/ui";

export type ChatMessageAuthor = "user" | "assistant";
export type ChatMessageStatus = "pending" | "sent";

export interface ChatMessageData {
  id: string;
  author: ChatMessageAuthor;
  text: string;
  time: string;
  status?: ChatMessageStatus;
}

export interface ChatMessageProps {
  message: ChatMessageData;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.author === "user";
  const isPending = message.status === "pending";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-card px-4 py-3 text-body",
          isUser
            ? "rounded-br-md bg-primary text-surface"
            : "rounded-bl-md bg-surface-secondary text-text",
        )}
      >
        <p>{message.text}</p>
        <span
          className={cn(
            "mt-1 flex items-center gap-2 text-caption",
            isUser ? "text-surface/70" : "text-text-muted",
          )}
        >
          {message.time}
          {isPending && <LoadingDots aria-label="Sending" />}
        </span>
      </div>
    </div>
  );
}

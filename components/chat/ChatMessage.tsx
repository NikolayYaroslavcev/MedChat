import { cn } from "@/lib/utils";

export type ChatMessageAuthor = "user" | "assistant";

export interface ChatMessageData {
  id: string;
  author: ChatMessageAuthor;
  text: string;
  time: string;
}

export interface ChatMessageProps {
  message: ChatMessageData;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.author === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-card px-4 py-3 text-body",
          isUser ? "bg-primary text-surface" : "bg-surface-secondary text-text",
        )}
      >
        <p>{message.text}</p>
        <span className={cn("mt-1 block text-caption", isUser ? "text-surface/70" : "text-text-muted")}>
          {message.time}
        </span>
      </div>
    </div>
  );
}

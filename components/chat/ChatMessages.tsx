import { ChatMessage } from "@/components/chat/ChatMessage";
import type { ChatMessageData } from "@/components/chat/ChatMessage";

export interface ChatMessagesProps {
  messages: ChatMessageData[];
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  return (
    <div className="flex flex-col gap-3 py-4">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
    </div>
  );
}

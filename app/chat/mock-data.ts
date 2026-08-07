import type { ChatMessageData } from "@/components/chat/ChatMessage";

export const mockMessages: ChatMessageData[] = [
  { id: "c1", author: "assistant", text: "Hi! How can I help you today?", time: "09:41" },
  { id: "c2", author: "user", text: "I'd like to reschedule my appointment.", time: "09:42" },
  { id: "c3", author: "assistant", text: "Sure — which day works best for you?", time: "09:42" },
];

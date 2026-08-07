import type { MeetingData } from "@/components/meetings/MeetingCard";
import type { ChatMessageData } from "@/components/chat/ChatMessage";

export const mockMeetings: MeetingData[] = [
  { id: "m1", title: "Consultation with Dr. Novak", time: "Today · 14:30", status: "scheduled" },
  { id: "m2", title: "Follow-up check-in", time: "Yesterday · 10:00", status: "completed" },
  { id: "m3", title: "Physiotherapy session", time: "Mon, Aug 3 · 09:15", status: "cancelled" },
];

export const mockMessages: ChatMessageData[] = [
  { id: "c1", author: "assistant", text: "Hi! How can I help you today?", time: "09:41" },
  { id: "c2", author: "user", text: "I'd like to reschedule my appointment.", time: "09:42" },
  { id: "c3", author: "assistant", text: "Sure — which day works best for you?", time: "09:42" },
];

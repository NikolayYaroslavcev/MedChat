"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { ChatMessageData } from "@/components/chat/ChatMessage";

const WS_URL = process.env.NEXT_PUBLIC_CHAT_WS_URL ?? "ws://localhost:8081";

export interface ChatPanelProps {
  title: string;
  messages: ChatMessageData[];
}

function createMessageId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

interface OutboxEntry {
  id: string;
  text: string;
}

export function ChatPanel({ title, messages: initialMessages }: ChatPanelProps) {
  const { status, send, lastMessage } = useWebSocket(WS_URL);
  const [messages, setMessages] = useState<ChatMessageData[]>(initialMessages);

  // Messages created while disconnected, waiting to be dispatched once reconnected.
  const outboxRef = useRef<OutboxEntry[]>([]);
  // Messages already sent over the socket, waiting for their echo, in send order.
  const waitingForEchoRef = useRef<string[]>([]);

  const dispatch = useCallback(
    (entry: OutboxEntry) => {
      send(entry.text);
      waitingForEchoRef.current.push(entry.id);
    },
    [send],
  );

  const handleSend = useCallback(
    (text: string) => {
      const entry: OutboxEntry = { id: createMessageId(), text };

      setMessages((prev) => [
        ...prev,
        { id: entry.id, author: "user", text, time: formatTime(new Date()), status: "pending" },
      ]);

      if (status === "connected") {
        dispatch(entry);
      } else {
        outboxRef.current.push(entry);
      }
    },
    [status, dispatch],
  );

  // Flush anything queued while offline as soon as the connection comes back.
  useEffect(() => {
    if (status !== "connected" || outboxRef.current.length === 0) return;

    const outbox = outboxRef.current;
    outboxRef.current = [];
    outbox.forEach(dispatch);
  }, [status, dispatch]);

  // Each echo confirms the oldest in-flight message, in the order it was sent.
  useEffect(() => {
    if (lastMessage === null) return;

    const id = waitingForEchoRef.current.shift();
    if (!id) return;

    setMessages((prev) =>
      prev.map((message) => (message.id === id ? { ...message, status: "sent" } : message)),
    );
  }, [lastMessage]);

  return (
    <Card padding="lg" className="flex flex-col">
      <ChatHeader title={title} status={status} />
      <ChatMessages messages={messages} />
      <ChatComposer onSend={handleSend} />
    </Card>
  );
}

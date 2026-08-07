"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Send } from "lucide-react";
import { Button, Input } from "@/components/ui";

export interface ChatComposerProps {
  onSend?: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatComposer({ onSend, disabled = false, placeholder = "Write a message…" }: ChatComposerProps) {
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend?.(trimmed);
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 border-t border-border pt-4">
      <label htmlFor="chat-composer-input" className="sr-only">
        Message
      </label>
      <Input
        id="chat-composer-input"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
      <Button type="submit" disabled={disabled} aria-label="Send message">
        <Send aria-hidden="true" className="h-4 w-4" />
      </Button>
    </form>
  );
}

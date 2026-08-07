"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import { Send } from "lucide-react";
import { Button, Input } from "@/components/ui";

export interface ChatComposerProps {
  onSend?: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatComposer({
  onSend,
  disabled = false,
  placeholder = "Write a message…",
}: ChatComposerProps) {
  const [value, setValue] = useState("");
  const inputId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend?.(trimmed);
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 border-t border-border pt-4">
      <label htmlFor={inputId} className="sr-only">
        Message
      </label>
      <Input
        id={inputId}
        className="min-w-0 flex-1"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
      <Button type="submit" disabled={disabled} aria-label="Send message" className="shrink-0">
        <Send aria-hidden="true" className="h-4 w-4" />
      </Button>
    </form>
  );
}

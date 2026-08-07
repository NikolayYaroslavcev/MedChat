"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type WebSocketStatus = "connecting" | "connected" | "disconnected";

export interface WebSocketMessage {
  data: string;
}

export interface UseWebSocketResult {
  status: WebSocketStatus;
  send: (text: string) => void;
  lastMessage: WebSocketMessage | null;
}

const RECONNECT_DELAY_MS = 2000;

export function useWebSocket(url: string): UseWebSocketResult {
  const [status, setStatus] = useState<WebSocketStatus>("connecting");
  // A new object every message, even when `data` repeats — consumers watch
  // this by reference in a useEffect dependency array, and two identical
  // consecutive payloads must still be seen as two distinct arrivals.
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    function connect() {
      if (cancelled) return;

      setStatus("connecting");
      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = () => {
        setStatus("connected");
      };

      socket.onmessage = (event) => {
        setLastMessage({ data: event.data });
      };

      socket.onclose = () => {
        // A superseded socket (e.g. the one Strict Mode's mount/cleanup/mount
        // cycle discards) can fire this asynchronously after a newer socket
        // has already taken over socketRef — only clear the ref if this
        // socket is still the current one, otherwise we'd null out a live
        // connection out from under it.
        if (socketRef.current === socket) {
          socketRef.current = null;
        }
        if (cancelled) return;
        setStatus("disconnected");
        reconnectTimeoutRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
      };

      socket.onerror = () => {
        socket.close();
      };
    }

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimeoutRef.current !== null) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [url]);

  const send = useCallback((text: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(text);
    }
  }, []);

  return { status, send, lastMessage };
}

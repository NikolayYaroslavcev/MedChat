import { act } from "@testing-library/react";

/** Minimal stand-in for the browser WebSocket that tests drive by hand. */
export class MockWebSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;
  static instances: MockWebSocket[] = [];

  readyState = MockWebSocket.CONNECTING;
  sent: string[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(public url: string) {
    MockWebSocket.instances.push(this);
  }

  static latest(): MockWebSocket {
    const socket = MockWebSocket.instances.at(-1);
    if (!socket) throw new Error("no socket created");
    return socket;
  }

  send(data: string) {
    if (this.readyState !== MockWebSocket.OPEN) throw new Error("socket is not open");
    this.sent.push(data);
  }

  close() {
    if (this.readyState === MockWebSocket.CLOSED) return;
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.();
  }

  serverOpen() {
    act(() => {
      this.readyState = MockWebSocket.OPEN;
      this.onopen?.();
    });
  }

  serverMessage(data: string) {
    act(() => this.onmessage?.({ data }));
  }

  serverDrop() {
    act(() => this.close());
  }
}

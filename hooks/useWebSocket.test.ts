import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useWebSocket } from "@/hooks/useWebSocket";
import { MockWebSocket } from "@/test/mock-websocket";

const URL = "ws://chat.test";

beforeEach(() => {
  MockWebSocket.instances = [];
  vi.stubGlobal("WebSocket", MockWebSocket);
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("useWebSocket", () => {
  it("reports connecting, then connected once the socket opens", () => {
    const { result } = renderHook(() => useWebSocket(URL));
    expect(result.current.status).toBe("connecting");

    MockWebSocket.latest().serverOpen();
    expect(result.current.status).toBe("connected");
  });

  it("exposes every incoming message as a new object, even when the payload repeats", () => {
    const { result } = renderHook(() => useWebSocket(URL));
    const socket = MockWebSocket.latest();
    socket.serverOpen();

    socket.serverMessage("hello");
    const first = result.current.lastMessage;
    socket.serverMessage("hello");

    expect(result.current.lastMessage).toEqual({ data: "hello" });
    expect(result.current.lastMessage).not.toBe(first);
  });

  it("sends only while the socket is open", () => {
    const { result } = renderHook(() => useWebSocket(URL));
    const socket = MockWebSocket.latest();

    act(() => result.current.send("too early"));
    expect(socket.sent).toEqual([]);

    socket.serverOpen();
    act(() => result.current.send("hi"));
    expect(socket.sent).toEqual(["hi"]);
  });

  it("reconnects after a dropped connection", () => {
    const { result } = renderHook(() => useWebSocket(URL));
    MockWebSocket.latest().serverOpen();

    MockWebSocket.latest().serverDrop();
    expect(result.current.status).toBe("disconnected");
    expect(MockWebSocket.instances).toHaveLength(1);

    act(() => vi.advanceTimersByTime(2000));
    expect(MockWebSocket.instances).toHaveLength(2);
    expect(result.current.status).toBe("connecting");

    MockWebSocket.latest().serverOpen();
    expect(result.current.status).toBe("connected");
  });

  it("closes the socket on unmount and does not reconnect", () => {
    const { unmount } = renderHook(() => useWebSocket(URL));
    const socket = MockWebSocket.latest();
    socket.serverOpen();

    unmount();
    act(() => vi.advanceTimersByTime(10_000));

    expect(socket.readyState).toBe(MockWebSocket.CLOSED);
    expect(MockWebSocket.instances).toHaveLength(1);
  });
});

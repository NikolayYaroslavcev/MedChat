import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { MockWebSocket } from "@/test/mock-websocket";

beforeEach(() => {
  MockWebSocket.instances = [];
  vi.stubGlobal("WebSocket", MockWebSocket);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function sendMessage(text: string) {
  await userEvent.type(screen.getByLabelText("Message"), text);
  await userEvent.click(screen.getByRole("button", { name: "Send message" }));
}

function bubble(text: string) {
  return screen.getByText(text).parentElement as HTMLElement;
}

function isPending(text: string) {
  return within(bubble(text)).queryByLabelText("Sending") !== null;
}

describe("ChatPanel", () => {
  it("shows a sent message immediately as pending and confirms it on echo", async () => {
    render(<ChatPanel title="Support" messages={[]} />);
    const socket = MockWebSocket.latest();
    socket.serverOpen();

    await sendMessage("Hello");

    expect(socket.sent).toEqual(["Hello"]);
    expect(isPending("Hello")).toBe(true);

    socket.serverMessage("Hello");
    expect(isPending("Hello")).toBe(false);
  });

  it("queues messages typed while offline and flushes them in order on reconnect", async () => {
    render(<ChatPanel title="Support" messages={[]} />);
    const socket = MockWebSocket.latest();

    await sendMessage("first");
    await sendMessage("second");

    expect(socket.sent).toEqual([]);
    expect(isPending("first")).toBe(true);
    expect(isPending("second")).toBe(true);

    socket.serverOpen();
    expect(socket.sent).toEqual(["first", "second"]);
  });

  it("confirms in-flight messages oldest first, one per echo", async () => {
    render(<ChatPanel title="Support" messages={[]} />);
    const socket = MockWebSocket.latest();
    socket.serverOpen();

    await sendMessage("one");
    await sendMessage("two");

    socket.serverMessage("ack");
    expect(isPending("one")).toBe(false);
    expect(isPending("two")).toBe(true);

    socket.serverMessage("ack");
    expect(isPending("two")).toBe(false);
  });

  it("ignores blank input", async () => {
    render(<ChatPanel title="Support" messages={[]} />);
    const socket = MockWebSocket.latest();
    socket.serverOpen();

    await sendMessage("   ");

    expect(socket.sent).toEqual([]);
  });
});

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Container } from "@/components/ui";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { MeetingsPanel } from "@/components/meetings/MeetingsPanel";
import { mockMessages } from "@/app/chat/mock-data";
import { createQueryClient } from "@/lib/query-client";
import { meetingsQueryOptions } from "@/lib/query/meetings";

export default async function ChatPage() {
  const queryClient = createQueryClient();
  await queryClient.prefetchQuery(meetingsQueryOptions());

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-surface/70 shadow-glass backdrop-blur-md">
        <Container size="xl">
          <div className="py-5">
            <span className="text-h2 text-text">MedChat</span>
          </div>
        </Container>
      </header>

      <main className="flex-1 py-12">
        <Container size="xl">
          <div className="flex flex-col gap-2">
            <p className="text-caption uppercase text-text-muted">Care coordination</p>
            <h1 className="text-display text-text">Today&apos;s care summary</h1>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <HydrationBoundary state={dehydrate(queryClient)}>
              <MeetingsPanel title="Upcoming meetings" />
            </HydrationBoundary>

            <ChatPanel title="Support chat" messages={mockMessages} />
          </div>
        </Container>
      </main>
    </div>
  );
}

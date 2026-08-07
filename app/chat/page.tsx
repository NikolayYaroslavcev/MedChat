import { Badge, Button, Card, Container, Input, StatusIndicator } from "@/components/ui";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessages } from "@/components/chat/ChatMessages";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { MeetingList } from "@/components/meetings/MeetingList";
import { mockMeetings, mockMessages } from "@/app/chat/mock-data";

export default function ChatPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-surface/70 shadow-glass backdrop-blur-md">
        <Container size="xl">
          <div className="flex items-center justify-between py-4">
            <span className="text-h2 text-text">MedChat</span>
            <StatusIndicator status="connected" />
          </div>
        </Container>
      </header>

      <main className="flex-1 py-10">
        <Container size="xl">
          <div className="flex flex-col gap-2">
            <p className="text-caption uppercase text-text-muted">Overview</p>
            <h1 className="text-display text-text">Good morning</h1>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <MeetingList title="Upcoming meetings" meetings={mockMeetings} />

            <Card padding="lg" className="flex flex-col">
              <ChatHeader title="Support chat" status="connected" />
              <ChatMessages messages={mockMessages} />
              <ChatComposer />
            </Card>
          </div>

          <section className="mt-12">
            <Card padding="lg">
              <p className="text-caption uppercase text-text-muted">Developer Preview</p>
              <h2 className="mt-1 text-h2 text-text">Component states</h2>

              <div className="mt-6 flex flex-col gap-8">
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="primary" loading>
                    Loading
                  </Button>
                  <Button variant="primary" disabled>
                    Disabled
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="danger">Danger</Badge>
                  <Badge variant="neutral">Neutral</Badge>
                </div>

                <div className="grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
                  <Input aria-label="Default input" placeholder="Default" />
                  <Input aria-label="Error input" placeholder="Error" error defaultValue="Invalid value" />
                  <Input aria-label="Disabled input" placeholder="Disabled" disabled />
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <StatusIndicator status="connected" />
                  <StatusIndicator status="connecting" />
                  <StatusIndicator status="disconnected" />
                </div>
              </div>
            </Card>
          </section>
        </Container>
      </main>
    </div>
  );
}

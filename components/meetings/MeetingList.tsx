import { Card, Divider } from "@/components/ui";
import { MeetingCard } from "@/components/meetings/MeetingCard";
import type { MeetingData } from "@/components/meetings/MeetingCard";

export interface MeetingListProps {
  title: string;
  meetings: MeetingData[];
}

export function MeetingList({ title, meetings }: MeetingListProps) {
  return (
    <Card padding="lg">
      <h2 className="text-h2 text-text">{title}</h2>
      <div className="mt-4 flex flex-col">
        {meetings.map((meeting, index) => (
          <div key={meeting.id}>
            <MeetingCard meeting={meeting} />
            {index < meetings.length - 1 && <Divider />}
          </div>
        ))}
      </div>
    </Card>
  );
}

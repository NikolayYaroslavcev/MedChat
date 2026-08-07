import { Badge } from "@/components/ui";
import type { BadgeVariant } from "@/components/ui";
import type { MeetingStatus } from "@/types/meeting";

export interface MeetingData {
  id: string;
  title: string;
  time: string;
  status: MeetingStatus;
}

export interface MeetingCardProps {
  meeting: MeetingData;
}

const statusLabels: Record<MeetingStatus, string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
};

const statusVariants: Record<MeetingStatus, BadgeVariant> = {
  scheduled: "neutral",
  completed: "success",
  cancelled: "danger",
};

export function MeetingCard({ meeting }: MeetingCardProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-body text-text">{meeting.title}</p>
        <p className="text-small text-text-muted">{meeting.time}</p>
      </div>
      <Badge variant={statusVariants[meeting.status]}>{statusLabels[meeting.status]}</Badge>
    </div>
  );
}

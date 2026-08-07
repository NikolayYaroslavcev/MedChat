"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui";
import { MeetingList } from "@/components/meetings/MeetingList";
import type { MeetingData } from "@/components/meetings/MeetingCard";
import { meetingsQueryOptions } from "@/lib/query/meetings";
import type { Meeting } from "@/types/meeting";

export interface MeetingsPanelProps {
  title: string;
}

function formatMeetingTime(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function toMeetingData(meeting: Meeting): MeetingData {
  return {
    id: meeting.id,
    title: meeting.title,
    time: formatMeetingTime(meeting.date),
    status: meeting.status,
  };
}

export function MeetingsPanel({ title }: MeetingsPanelProps) {
  const { data, refetch, isFetching } = useQuery(meetingsQueryOptions());

  return (
    <div className="flex flex-col gap-3">
      <MeetingList title={title} meetings={(data ?? []).map(toMeetingData)} />
      <Button variant="secondary" loading={isFetching} onClick={() => refetch()}>
        Refresh
      </Button>
    </div>
  );
}

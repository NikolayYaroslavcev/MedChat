export type MeetingStatus = "scheduled" | "completed" | "cancelled";

export interface Meeting {
  id: string;
  title: string;
  date: string; // ISO
  status: MeetingStatus;
}

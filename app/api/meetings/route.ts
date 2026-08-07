import { NextResponse } from "next/server";
import type { Meeting } from "@/types/meeting";

const meetings: Meeting[] = [
  {
    id: "m1",
    title: "Consultation with Dr. Novak",
    date: "2026-08-07T14:30:00.000Z",
    status: "scheduled",
  },
  { id: "m2", title: "Follow-up check-in", date: "2026-08-06T10:00:00.000Z", status: "completed" },
  {
    id: "m3",
    title: "Physiotherapy session",
    date: "2026-08-03T09:15:00.000Z",
    status: "cancelled",
  },
  {
    id: "m4",
    title: "Nutrition consultation",
    date: "2026-08-10T11:00:00.000Z",
    status: "scheduled",
  },
];

export async function GET() {
  return NextResponse.json(meetings);
}

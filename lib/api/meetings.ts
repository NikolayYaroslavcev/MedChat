import type { Meeting } from "@/types/meeting";

// This module runs on both sides: Server Components need an absolute URL
// (there is no request origin to resolve a relative path against), while the
// browser must use a relative path so it targets whatever origin the app was
// actually loaded from, not a build-time guess.
const BASE_URL =
  typeof window === "undefined"
    ? (process.env.NEXT_PUBLIC_APP_URL ?? `http://localhost:${process.env.PORT ?? "3000"}`)
    : "";

export async function getMeetings(): Promise<Meeting[]> {
  const res = await fetch(`${BASE_URL}/api/meetings`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to fetch meetings: ${res.status}`);
  }

  return res.json();
}

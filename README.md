# MedChat

A care-coordination interface combining a live support chat with an upcoming-meetings
overview, built on the Next.js App Router.

## Overview

MedChat is a single-page dashboard (`/chat`) with two independent panels:

- **Upcoming meetings** — a server-rendered list backed by an internal API route, refreshable
  on demand from the client.
- **Support chat** — a WebSocket-driven chat with optimistic sends, an offline queue, and
  automatic reconnect.

The two panels intentionally use different data strategies (request/response vs. a
persistent socket) to reflect how each kind of data actually behaves: meetings are a
point-in-time read that's cheap to refetch, chat is a continuous stream that must survive
disconnects.

## Features

- Meetings list prefetched on the server and hydrated on the client, with a manual refresh
- Chat composer with optimistic UI (pending → sent), a per-message ordering guarantee, and
  a queue for messages composed while offline
- Automatic WebSocket reconnect with visible connection status (Live / Reconnecting / Offline)
- A small token-driven design system (`components/ui`) — no ad hoc styling in feature components

## Tech stack

- **Next.js 16 (App Router) + React 19 + TypeScript** — routing, Server/Client Component split
- **Tailwind CSS v4** — token-driven theme in `app/globals.css`, consumed via `components/ui`
- **TanStack Query v5** — server-prefetch + client hydration for the meetings list
- **Native WebSocket API** — no client library; the reconnect/queue/ack logic is hand-rolled
  in `hooks/useWebSocket.ts` since the requirements (offline queue, ordered acks) don't map
  onto a generic socket library's defaults

## Architecture

### Server / Client Components

`app/chat/page.tsx` is an `async` **Server Component**. It prefetches the meetings query on
the server and passes the dehydrated cache down through `HydrationBoundary`, so the meetings
list has data on first paint with no client-side loading flash. Only the pieces that need
interactivity are `"use client"`: `MeetingsPanel` (owns the `useQuery`/refresh), and the
entire chat panel (`ChatPanel` and everything under it), since a WebSocket connection is
inherently a client-only concern. Static presentational components (`MeetingCard`,
`MeetingList`, `ChatMessages`, `ChatHeader`) stay server-renderable — they take data as props
and have no client-only APIs, so there's no reason to ship them as client bundles.

### SSR strategy for the meetings list

`getMeetings` (`lib/api/meetings.ts`) is called from two different runtimes with two
different URL-resolution rules, and the module accounts for both:

- On the **server**, `fetch` has no implicit origin to resolve a relative path against, so
  the request needs an absolute URL — built from `NEXT_PUBLIC_APP_URL` if set, otherwise
  `http://localhost:<PORT>` for local dev.
- In the **browser**, the request must go to whatever origin the page actually loaded from
  (`typeof window !== "undefined"` branch uses a relative path), so the same code keeps
  working after a deploy without needing `NEXT_PUBLIC_APP_URL` set for local development.

`queryOptions` (`lib/query/meetings.ts`) is the single source of truth for the query key and
fetcher, shared by the server-side `prefetchQuery` call and the client-side `useQuery` —
there's exactly one place that knows how to fetch meetings.

The Route Handler at `app/api/meetings/route.ts` exists because the client-side "Refresh"
button needs something to call over HTTP; the Server Component's prefetch also goes through
it (rather than reading the mock data directly) to keep a single request path for both
callers and to mirror how this would work against a real backend.

### WebSocket strategy

`hooks/useWebSocket.ts` owns the socket lifecycle; `ChatPanel` owns chat state built on top
of it. Deliberate choices:

- **Reconnect**: on any close, a new socket is opened after a fixed 2s delay. There's no
  backoff or attempt cap — acceptable for this scope, called out below as a limitation.
- **Strict Mode safety**: React 19 Strict Mode mounts effects twice in development, which
  can create a socket that's immediately torn down. The `onclose` handler only clears
  `socketRef` if the closing socket is still the current one, so a stale socket's async
  close event can't null out a live connection that superseded it.
- **Message identity, not content**: incoming messages are stored as `{ data }` — a fresh
  object every time — rather than the raw string. `ChatPanel` reacts to an incoming message
  by reference in a `useEffect`, and two consecutive echoes with identical text still need to
  be seen as two separate arrivals; storing a bare string would make React bail out on the
  second identical value and silently drop it.
- **Offline queue + ordered acks**: `ChatPanel` keeps two refs — an outbox for messages
  composed while disconnected, and a FIFO of message IDs waiting for an echo. This assumes
  the transport echoes back sends in the order they were received, which holds for the
  echo-style test server this app targets against (`NEXT_PUBLIC_CHAT_WS_URL`).

## Project structure

```
app/
  chat/            /chat route: Server Component page, mock seed messages
  api/meetings/     Route Handler backing the meetings list
components/
  chat/            Chat panel and its subcomponents
  meetings/        Meetings panel and its subcomponents
  ui/              Design system primitives (Button, Card, Badge, Input, ...)
hooks/
  useWebSocket.ts  Socket lifecycle: connect, reconnect, send, status
lib/
  api/             Fetch functions (server- and client-callable)
  query/           TanStack Query options and query keys
providers/         QueryClientProvider setup
types/             Shared domain types
```

## Design decisions

- **Query Options pattern** (`lib/query/meetings.ts`): the query key and fetcher are defined
  once via `queryOptions(...)` and reused by both the server prefetch and the client hook, so
  there's no risk of the two drifting out of sync.
- **A fresh `QueryClient` per server request, per client mount**: `createQueryClient()` is
  called directly in the Server Component (new instance per request — no cross-request cache
  sharing) and inside `useState(() => createQueryClient())` in the client provider (created
  once per mount, not recreated on re-render).
- **No animation library**: the two motion effects in the app (status pulse, loading dots)
  are plain CSS `@keyframes` in `globals.css`, wired through Tailwind's `--animate-*` theme
  tokens — not worth a dependency for two effects.

## Known limitations

- Meetings are served from a static in-memory array (`app/api/meetings/route.ts`); there's no
  persistence or write path.
- WebSocket reconnect uses a fixed 2s delay with no backoff or max-attempt cutoff — fine for a
  demo, not what you'd want against a flaky production endpoint.
- The chat message list has no scroll container or max height; it's fine at demo scale but
  would need one before it's used with a long-running conversation.
- Chat timestamps (`en-GB`, 24-hour) and meeting timestamps (`en-US`, 12-hour) use different
  locale formats — cosmetic, not fixed since it doesn't affect correctness.

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/chat`.

The chat panel connects to `NEXT_PUBLIC_CHAT_WS_URL` (defaults to `ws://localhost:8081`);
without a server listening there it will show as reconnecting.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` / `npm run start` — production build and serve
- `npm run lint` — ESLint
- `npm run format` / `npm run format:check` — Prettier
- `npm run knip` — unused files/exports report

# Design System Foundation — Design Spec

Date: 2026-08-07
Status: Approved (user-specified, refined over two rounds of requirements)

## Goal

Establish the visual foundation for a commercial medical-SaaS chat product: design
tokens, a small set of reusable UI primitives, chat/meetings component scaffolding
(presentational only), and a `/chat` demo page. No business logic, no data
fetching, no WebSocket, no TanStack Query usage in this phase.

## Stack constraints

React + Tailwind CSS v4 + CSS variables only. No shadcn/ui, Radix, MUI, Ant
Design, Bootstrap, Framer Motion, or any prebuilt UI kit. Keep Geist as the
typeface (already wired via `next/font` in `app/layout.tsx`).

## Design tokens (`app/globals.css`)

All tokens defined as CSS variables on `:root`, then bridged into Tailwind v4
utilities via `@theme inline`. Dark mode block (`prefers-color-scheme: dark`)
is removed entirely — light theme only.

### Color

Custom blue-tinted neutral ramp (not Tailwind's default gray), primary/accent
with hover+active steps, semantic colors each with a "subtle" tint for
badges/banners:

```
--background          #F6F8FC
--surface              #FFFFFF
--surface-secondary    #F1F4FA   (nested/inset surfaces: bot bubbles, inset rows)

--text                 #171B26
--text-secondary       #3F4759
--text-muted           #667085

--border               #E3E8F1
--border-hover         #CBD3E1

--primary              #4F7CFF
--primary-hover        #3D63E0
--primary-active       #3454C4

--accent               #5CC8A1
--accent-hover         #45B48D

--success              #1FAA6B
--success-subtle       #E6F7EE
--warning              #F5A623
--warning-subtle       #FDF3E0
--danger               #E5484D
--danger-subtle        #FDEAEA

neutral-50 … neutral-900  (own ramp, same hue family as primary)
```

Text-on-primary uses `--surface` (#FFFFFF) rather than a raw Tailwind
`white` utility, so every color reference stays inside the token system.

### Typography

Own type scale exposed as Tailwind v4 custom font-size tokens (`text-display`,
`text-h1`, `text-h2`, `text-body`, `text-small`, `text-caption`), each token
carrying its own line-height and letter-spacing. Font-weight is applied via a
paired Tailwind weight utility (documented per level, not baked into the
token) since Tailwind v4 font-size tokens don't carry weight.

| Level   | Size / Line-height | Letter-spacing | Weight |
|---------|---------------------|-----------------|--------|
| Display | 40px / 48px         | -2%             | 600    |
| H1      | 32px / 40px          | -1.5%           | 600    |
| H2      | 22px / 30px          | -1%             | 600    |
| Body    | 15px / 24px          | 0                | 400    |
| Small   | 13px / 20px          | 0                | 400    |
| Caption | 12px / 16px          | +2%             | 500    |

### Radius & shadow

```
--radius-card     20px   (Card)
--radius-control  12px   (Button, Input)
--radius-pill     999px  (Badge, StatusIndicator pill)
```

Shadows are soft and multi-layered (a tight low-opacity layer + a wide soft
layer), never a single hard black shadow:

```
--shadow-card         0 1px 2px rgba(23,27,38,.04), 0 12px 24px -8px rgba(23,27,38,.08)
--shadow-card-hover    0 2px 4px rgba(23,27,38,.05), 0 20px 40px -12px rgba(23,27,38,.14)
--shadow-glass         0 1px 0 rgba(23,27,38,.04), 0 8px 24px -8px rgba(23,27,38,.10)
```

### Glass

Used sparingly, only on the page's floating top bar (translucent surface +
`backdrop-filter: blur`), not on content cards. Cards stay opaque white with
`--shadow-card` — matches Stripe Dashboard / Doctolib rather than a
glass-heavy look.

### Motion

CSS-only. Tailwind `transition-colors` / `transition-transform` /
`transition-shadow`, `hover:`, `focus-visible:`, `active:`. One custom
`@keyframes` for `LoadingDots`, one for the `connecting` pulse on
`StatusIndicator`. No animation library.

## Components — `components/ui/`

| Component | Props | Notes |
|---|---|---|
| `Button` | `variant: primary \| secondary \| ghost`, `loading?: boolean`, standard button props | `disabled` + `loading` both block interaction; `loading` swaps label area for `LoadingDots`; `active:scale-[0.98]`; focus-visible ring in `--primary` |
| `Card` | `padding?: sm \| md \| lg` (default md), `hoverable?: boolean`, standard div props | sm=16px, md=24px, lg=32px; `hoverable` adds shadow/translateY transition on hover |
| `Badge` | `variant: success \| warning \| danger \| neutral` | Generic — no meeting-specific variants. Subtle bg + solid-tone text per variant. Domain components choose the variant. |
| `Input` | `error?: boolean`, standard input props, `forwardRef` | error state swaps border/ring to `--danger`; disabled gets muted bg + `cursor-not-allowed` |
| `StatusIndicator` | `status: connected \| connecting \| disconnected` | Naming matches WebSocket semantics for future wiring. `connected`→success dot, `connecting`→warning dot with pulse keyframe, `disconnected`→neutral-400 dot (muted, not danger — an expected idle state, not an error) |
| `Container` | `size?: sm \| md \| lg \| xl` (default lg) | max-width wrapper with responsive horizontal padding |
| `Divider` | standard div props | `border-t border-border`, full width |
| `LoadingDots` | standard div props | 3 dots, staggered CSS keyframe opacity/translate pulse; reused inside `Button` loading state and chat typing indicator |

A barrel `components/ui/index.ts` re-exports all of the above for ergonomic
imports (`import { Button, Card } from "@/components/ui"`).

## Domain scaffolding (presentational only, mock/static props)

```
components/chat/
  ChatHeader.tsx       title + ConnectionStatus
  ConnectionStatus.tsx thin wrapper: StatusIndicator + chat-specific label
  ChatMessages.tsx      maps a list to ChatMessage
  ChatMessage.tsx       single bubble, own vs. other styling via prop
  ChatComposer.tsx      Input + send Button (+ LoadingDots when "typing")

components/meetings/
  MeetingCard.tsx   single meeting row: title, time, Badge
                    (status→variant mapping lives here: scheduled→neutral,
                    completed→success, cancelled→danger)
  MeetingList.tsx   Card wrapping mapped MeetingCard rows + Divider between rows
```

No WebSocket, no TanStack Query, no route handlers, no fetch — all data is
inline mock data local to the demo page or the components themselves.

## `/chat` demo page (`app/chat/page.tsx`)

- `Container` (size `xl`) wrapping the whole page, generous vertical rhythm.
- Thin floating top bar: product name/mark + `StatusIndicator` (`connected`),
  using the glass treatment.
- Two-column responsive grid: `MeetingList` (mock meetings covering all three
  status variants) on one side, a chat `Card` composed of `ChatHeader` +
  `ChatMessages` (mock thread) + `ChatComposer` on the other.
- A small **Developer Preview** block at the bottom — framed as an internal
  product panel (eyebrow caption, not a component-library showcase) — showing
  all `Button` variants, all `Badge` variants, `Input` default/error/disabled,
  and all three `StatusIndicator` states.

`app/layout.tsx` metadata is updated away from the CNA defaults
("Create Next App"). `app/page.tsx` (CNA placeholder) is left untouched.

## Out of scope (explicitly deferred)

TanStack Query wiring, SSR data loading, API/route handlers, real WebSocket
connection, any business logic. This phase is the visual foundation only.

## Verification

`npm run lint` and `npm run build` must both pass with zero errors and zero
warnings before this phase is considered done.

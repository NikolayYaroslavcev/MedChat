# Design System Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the token-driven design system (colors, typography, radius, shadow), eight `components/ui` primitives, presentational `components/chat` and `components/meetings` scaffolding, and a `/chat` demo page — no business logic, no data fetching, no WebSocket.

**Architecture:** CSS variables in `app/globals.css`, bridged into Tailwind v4 utilities via `@theme inline` (so `bg-primary`, `text-display`, `rounded-card`, `shadow-card`, `animate-status-pulse`, etc. become real Tailwind classes backed by our tokens, not Tailwind's defaults). UI primitives are plain function components (no client state except where noted) with exported, explicit prop interfaces. Domain components (`chat/`, `meetings/`) compose the primitives and take their data as typed props so a later data-fetching phase can swap in real data without touching these files.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS v4, `clsx` + `tailwind-merge` (via existing `lib/utils.ts` `cn` helper), `lucide-react` (already installed, one icon used). No new dependencies.

## Global Constraints

These apply to every task below; copied from
`docs/superpowers/specs/2026-08-07-design-system-design.md`.

- No shadcn/ui, Radix, MUI, Ant Design, Bootstrap, Framer Motion, or any prebuilt UI kit/animation library.
- No new runtime dependencies. Only `clsx`, `tailwind-merge`, `lucide-react` (already installed) may be used.
- Keep Geist as the typeface (`app/layout.tsx` already wires `--font-geist-sans` / `--font-geist-mono`).
- Dark mode is removed entirely from `app/globals.css` — light theme only.
- No `any` in TypeScript. No `eslint-disable` unless truly unavoidable.
- Every component exports an explicit prop interface (e.g. `ButtonProps`) extending the relevant `React.ComponentPropsWithoutRef<...>` / `React.HTMLAttributes<...>`.
- Component classNames use the token-backed Tailwind utilities (`bg-primary`, `text-text-muted`, `border-border`, `rounded-card`, `shadow-card`, …) — never raw hex codes or Tailwind's default palette (`blue-500`, `gray-200`, etc.).
- Every focusable primitive reuses the shared `focusRing` constant from `components/ui/styles.ts` instead of repeating ring utility classes.
- Every interactive element has a visible `focus-visible` state and a real `disabled` attribute where applicable; decorative dots/icons get `aria-hidden`; `StatusIndicator` renders its state as real text inside a `role="status"` wrapper.
- No `React.memo`/`useMemo`/`useCallback` without a measured reason.
- `MeetingList`/`MeetingCard` and `ChatMessages`/`ChatMessage` receive their data via typed props (`meetings`, `messages`), never own mock data internally.
- `ChatComposer` exposes `onSend?(text: string)` and `disabled?: boolean`; its own text-field value is local UI state, not business logic.
- File naming: PascalCase filenames matching the exported component (`Button.tsx`, `ChatHeader.tsx`, …); barrel file is lowercase `index.ts`.
- `npm run lint` and `npm run build` must both finish with zero errors and zero warnings before this phase is considered done (Task 16).

---

## Task 1: Design tokens — `globals.css` + page metadata

**Files:**
- Modify: `app/globals.css` (full rewrite)
- Modify: `app/layout.tsx:16-19` (metadata only)

**Interfaces:**
- Consumes: nothing (first task).
- Produces: Tailwind utilities every later task relies on — `bg-background`, `bg-surface`, `bg-surface-secondary`, `text-text`, `text-text-secondary`, `text-text-muted`, `border-border`, `border-border-hover`, `bg-primary`/`hover:bg-primary-hover`/`active:bg-primary-active`, `bg-accent`/`hover:bg-accent-hover`, `bg-success`/`bg-success-subtle`/`text-success`, `bg-warning`/`bg-warning-subtle`/`text-warning`, `bg-danger`/`bg-danger-subtle`/`text-danger`, `bg-neutral-50`…`bg-neutral-900`, `rounded-card`/`rounded-control`/`rounded-pill`, `shadow-card`/`shadow-card-hover`/`shadow-glass`, `text-display`/`text-h1`/`text-h2`/`text-body`/`text-small`/`text-caption` (each carrying size+line-height+letter-spacing+font-weight), `animate-status-pulse`, `animate-loading-dot`.

- [ ] **Step 1: Replace `app/globals.css`**

```css
@import "tailwindcss";

:root {
  /* Neutral ramp — own scale, not Tailwind's gray */
  --neutral-50: #f6f8fc;
  --neutral-100: #eef1f8;
  --neutral-200: #e3e8f1;
  --neutral-300: #cbd3e1;
  --neutral-400: #a8b3c7;
  --neutral-500: #8592ab;
  --neutral-600: #667085;
  --neutral-700: #4b5468;
  --neutral-800: #313749;
  --neutral-900: #1b2030;

  /* Surfaces */
  --background: var(--neutral-50);
  --surface: #ffffff;
  --surface-secondary: #f1f4fa;

  /* Text */
  --text: #171b26;
  --text-secondary: #3f4759;
  --text-muted: var(--neutral-600);

  /* Borders */
  --border: var(--neutral-200);
  --border-hover: var(--neutral-300);

  /* Brand */
  --primary: #4f7cff;
  --primary-hover: #3d63e0;
  --primary-active: #3454c4;
  --accent: #5cc8a1;
  --accent-hover: #45b48d;

  /* Semantic */
  --success: #1faa6b;
  --success-subtle: #e6f7ee;
  --warning: #f5a623;
  --warning-subtle: #fdf3e0;
  --danger: #e5484d;
  --danger-subtle: #fdeaea;

  /* Radius */
  --radius-card: 1.25rem;
  --radius-control: 0.75rem;
  --radius-pill: 9999px;

  /* Shadow — soft, multi-layered, never a single hard black shadow */
  --shadow-card: 0 1px 2px rgba(23, 27, 38, 0.04), 0 12px 24px -8px rgba(23, 27, 38, 0.08);
  --shadow-card-hover: 0 2px 4px rgba(23, 27, 38, 0.05), 0 20px 40px -12px rgba(23, 27, 38, 0.14);
  --shadow-glass: 0 1px 0 rgba(23, 27, 38, 0.04), 0 8px 24px -8px rgba(23, 27, 38, 0.1);
}

@theme inline {
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);

  --color-background: var(--background);
  --color-surface: var(--surface);
  --color-surface-secondary: var(--surface-secondary);

  --color-text: var(--text);
  --color-text-secondary: var(--text-secondary);
  --color-text-muted: var(--text-muted);

  --color-border: var(--border);
  --color-border-hover: var(--border-hover);

  --color-primary: var(--primary);
  --color-primary-hover: var(--primary-hover);
  --color-primary-active: var(--primary-active);
  --color-accent: var(--accent);
  --color-accent-hover: var(--accent-hover);

  --color-success: var(--success);
  --color-success-subtle: var(--success-subtle);
  --color-warning: var(--warning);
  --color-warning-subtle: var(--warning-subtle);
  --color-danger: var(--danger);
  --color-danger-subtle: var(--danger-subtle);

  --color-neutral-50: var(--neutral-50);
  --color-neutral-100: var(--neutral-100);
  --color-neutral-200: var(--neutral-200);
  --color-neutral-300: var(--neutral-300);
  --color-neutral-400: var(--neutral-400);
  --color-neutral-500: var(--neutral-500);
  --color-neutral-600: var(--neutral-600);
  --color-neutral-700: var(--neutral-700);
  --color-neutral-800: var(--neutral-800);
  --color-neutral-900: var(--neutral-900);

  --radius-card: var(--radius-card);
  --radius-control: var(--radius-control);
  --radius-pill: var(--radius-pill);

  --shadow-card: var(--shadow-card);
  --shadow-card-hover: var(--shadow-card-hover);
  --shadow-glass: var(--shadow-glass);

  /* Typography scale — each level is self-contained: size, line-height, */
  /* letter-spacing AND font-weight, so one class applies the whole style. */
  --text-display: 2.5rem;
  --text-display--line-height: 3rem;
  --text-display--letter-spacing: -0.02em;
  --text-display--font-weight: 600;

  --text-h1: 2rem;
  --text-h1--line-height: 2.5rem;
  --text-h1--letter-spacing: -0.015em;
  --text-h1--font-weight: 600;

  --text-h2: 1.375rem;
  --text-h2--line-height: 1.875rem;
  --text-h2--letter-spacing: -0.01em;
  --text-h2--font-weight: 600;

  --text-body: 0.9375rem;
  --text-body--line-height: 1.5rem;
  --text-body--letter-spacing: 0em;
  --text-body--font-weight: 400;

  --text-small: 0.8125rem;
  --text-small--line-height: 1.25rem;
  --text-small--letter-spacing: 0em;
  --text-small--font-weight: 400;

  --text-caption: 0.75rem;
  --text-caption--line-height: 1rem;
  --text-caption--letter-spacing: 0.02em;
  --text-caption--font-weight: 500;

  /* Motion — CSS-only keyframes, no animation library */
  --animate-status-pulse: status-pulse 1.4s ease-in-out infinite;
  --animate-loading-dot: loading-dot 1.1s ease-in-out infinite;
}

body {
  background: var(--background);
  color: var(--text);
  font-family: var(--font-sans), ui-sans-serif, system-ui, sans-serif;
}

@keyframes status-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.45;
    transform: scale(1.5);
  }
}

@keyframes loading-dot {
  0%,
  80%,
  100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  40% {
    opacity: 1;
    transform: translateY(-3px);
  }
}
```

- [ ] **Step 2: Update page metadata in `app/layout.tsx`**

Replace lines 16-19:

```tsx
export const metadata: Metadata = {
  title: "MedChat",
  description: "A calm, modern interface for care coordination and patient chat.",
};
```

- [ ] **Step 3: Verify the build picks up the new theme**

Run: `npx tsc --noEmit`
Expected: no errors (this task touches no `.tsx` logic, just CSS/metadata).

Run: `npm run dev` briefly is not required here — full visual verification happens in Task 16. Instead sanity-check the CSS is syntactically valid by running:
`npx postcss app/globals.css -o /dev/null` if `postcss-cli` were available — it is not, so instead run `npm run build` once now to catch any Tailwind theme syntax errors early (this is the one exception to deferring `build` to Task 16, since a broken theme file would silently break every later task).
Expected: build succeeds (existing `app/page.tsx` and the still-placeholder `app/chat/page.tsx` compile fine against the new tokens).

- [ ] **Step 4: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat(design-system): add token-driven theme, remove dark mode"
```

---

## Task 2: Shared focus-ring style + `LoadingDots`

**Files:**
- Create: `components/ui/styles.ts`
- Create: `components/ui/LoadingDots.tsx`

**Interfaces:**
- Consumes: Tailwind tokens from Task 1 (`focus-visible:ring-primary`, `animate-loading-dot`).
- Produces: `focusRing: string` (named export from `components/ui/styles.ts`); `LoadingDots` component + `LoadingDotsProps` interface, both exported from `components/ui/LoadingDots.tsx`. `LoadingDots` renders at `text-current` size so a parent's `text-*` color controls dot color.

- [ ] **Step 1: Create `components/ui/styles.ts`**

```ts
export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface";
```

- [ ] **Step 2: Create `components/ui/LoadingDots.tsx`**

```tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type LoadingDotsProps = HTMLAttributes<HTMLSpanElement>;

const DOT_DELAYS = [0, 0.15, 0.3];

export function LoadingDots({ className, ...props }: LoadingDotsProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    >
      {DOT_DELAYS.map((delay) => (
        <span
          key={delay}
          aria-hidden="true"
          className="h-1.5 w-1.5 animate-loading-dot rounded-full bg-current"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
    </span>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/ui/styles.ts components/ui/LoadingDots.tsx
git commit -m "feat(ui): add focusRing constant and LoadingDots primitive"
```

---

## Task 3: `Button`

**Files:**
- Create: `components/ui/Button.tsx`

**Interfaces:**
- Consumes: `focusRing` from `components/ui/styles.ts`; `LoadingDots` from `components/ui/LoadingDots.tsx`; `cn` from `lib/utils.ts`.
- Produces: `Button` (forwardRef to `HTMLButtonElement`), `ButtonProps`, `ButtonVariant = "primary" | "secondary" | "ghost"`, all exported from `components/ui/Button.tsx`. `loading` and `disabled` both set the native `disabled` attribute; `loading` replaces `children` with `LoadingDots`.

- [ ] **Step 1: Create `components/ui/Button.tsx`**

```tsx
import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { focusRing } from "@/components/ui/styles";
import { LoadingDots } from "@/components/ui/LoadingDots";

export type ButtonVariant = "primary" | "secondary" | "ghost";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-transparent bg-primary text-surface hover:bg-primary-hover active:bg-primary-active",
  secondary:
    "border border-border bg-surface text-text hover:border-border-hover hover:bg-surface-secondary",
  ghost:
    "border border-transparent bg-transparent text-text-secondary hover:bg-surface-secondary hover:text-text",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", loading = false, disabled, className, children, ...props },
  ref,
) {
  const isDisabled = disabled || loading;
  return (
    <button
      ref={ref}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-control px-5 py-2.5 text-small font-medium",
        "transition-colors transition-transform duration-150 ease-out active:scale-[0.98]",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
        focusRing,
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {loading ? (
        <LoadingDots className={variant === "primary" ? "text-surface" : "text-text-muted"} />
      ) : (
        children
      )}
    </button>
  );
});
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/ui/Button.tsx
git commit -m "feat(ui): add Button primitive (primary/secondary/ghost, loading state)"
```

---

## Task 4: `Card`

**Files:**
- Create: `components/ui/Card.tsx`

**Interfaces:**
- Consumes: `cn` from `lib/utils.ts`; Tailwind tokens from Task 1 (`rounded-card`, `shadow-card`, `shadow-card-hover`).
- Produces: `Card`, `CardProps`, `CardPadding = "sm" | "md" | "lg"`, exported from `components/ui/Card.tsx`.

- [ ] **Step 1: Create `components/ui/Card.tsx`**

```tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type CardPadding = "sm" | "md" | "lg";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: CardPadding;
  hoverable?: boolean;
}

const paddingClasses: Record<CardPadding, string> = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({ padding = "md", hoverable = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card border border-border bg-surface shadow-card transition-shadow transition-transform duration-200 ease-out",
        hoverable && "hover:-translate-y-0.5 hover:shadow-card-hover",
        paddingClasses[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/ui/Card.tsx
git commit -m "feat(ui): add Card primitive (padding sm/md/lg, hoverable)"
```

---

## Task 5: `Badge`

**Files:**
- Create: `components/ui/Badge.tsx`

**Interfaces:**
- Consumes: `cn` from `lib/utils.ts`.
- Produces: `Badge`, `BadgeProps`, `BadgeVariant = "success" | "warning" | "danger" | "neutral"`, exported from `components/ui/Badge.tsx`. Generic — carries no meeting-specific naming; callers map their own status to one of these four variants.

- [ ] **Step 1: Create `components/ui/Badge.tsx`**

```tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "success" | "warning" | "danger" | "neutral";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-success-subtle text-success",
  warning: "bg-warning-subtle text-warning",
  danger: "bg-danger-subtle text-danger",
  neutral: "bg-surface-secondary text-text-secondary",
};

export function Badge({ variant = "neutral", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill px-3 py-1 text-caption",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/ui/Badge.tsx
git commit -m "feat(ui): add generic Badge primitive (success/warning/danger/neutral)"
```

---

## Task 6: `Input`

**Files:**
- Create: `components/ui/Input.tsx`

**Interfaces:**
- Consumes: `focusRing` from `components/ui/styles.ts`; `cn` from `lib/utils.ts`.
- Produces: `Input` (forwardRef to `HTMLInputElement`), `InputProps`, exported from `components/ui/Input.tsx`. `error` swaps the border to `--danger` and sets `aria-invalid`; `disabled` forwards to the native attribute.

- [ ] **Step 1: Create `components/ui/Input.tsx`**

```tsx
import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { focusRing } from "@/components/ui/styles";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { error = false, disabled, className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      disabled={disabled}
      aria-invalid={error || undefined}
      className={cn(
        "w-full rounded-control border bg-surface px-4 py-2.5 text-body text-text placeholder:text-text-muted",
        "transition-colors duration-150 ease-out",
        error ? "border-danger" : "border-border hover:border-border-hover",
        "disabled:cursor-not-allowed disabled:border-border disabled:bg-surface-secondary disabled:text-text-muted",
        focusRing,
        className,
      )}
      {...props}
    />
  );
});
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/ui/Input.tsx
git commit -m "feat(ui): add Input primitive (error, disabled, focus states)"
```

---

## Task 7: `StatusIndicator`

**Files:**
- Create: `components/ui/StatusIndicator.tsx`

**Interfaces:**
- Consumes: `cn` from `lib/utils.ts`; `animate-status-pulse` token from Task 1.
- Produces: `StatusIndicator`, `StatusIndicatorProps`, `ConnectionState = "connected" | "connecting" | "disconnected"`, exported from `components/ui/StatusIndicator.tsx`. Status names match WebSocket-style semantics so a later `useWebSocket` hook can feed `status` directly. Renders `role="status"` with real text (not color-only); the dot is `aria-hidden`.

- [ ] **Step 1: Create `components/ui/StatusIndicator.tsx`**

```tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ConnectionState = "connected" | "connecting" | "disconnected";

export interface StatusIndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  status: ConnectionState;
  label?: string;
}

const statusConfig: Record<ConnectionState, { dot: string; text: string; defaultLabel: string }> = {
  connected: {
    dot: "bg-success",
    text: "text-text-secondary",
    defaultLabel: "Connected",
  },
  connecting: {
    dot: "bg-warning animate-status-pulse",
    text: "text-text-secondary",
    defaultLabel: "Connecting",
  },
  disconnected: {
    dot: "bg-neutral-400",
    text: "text-text-muted",
    defaultLabel: "Disconnected",
  },
};

export function StatusIndicator({ status, label, className, ...props }: StatusIndicatorProps) {
  const config = statusConfig[status];
  return (
    <span
      role="status"
      className={cn("inline-flex items-center gap-2 text-small", config.text, className)}
      {...props}
    >
      <span aria-hidden="true" className={cn("h-2 w-2 rounded-pill", config.dot)} />
      {label ?? config.defaultLabel}
    </span>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/ui/StatusIndicator.tsx
git commit -m "feat(ui): add StatusIndicator (connected/connecting/disconnected)"
```

---

## Task 8: `Container` + `Divider`

**Files:**
- Create: `components/ui/Container.tsx`
- Create: `components/ui/Divider.tsx`

**Interfaces:**
- Consumes: `cn` from `lib/utils.ts`.
- Produces: `Container`, `ContainerProps`, `ContainerSize = "sm" | "md" | "lg" | "xl"` from `components/ui/Container.tsx`; `Divider`, `DividerProps` from `components/ui/Divider.tsx`.

- [ ] **Step 1: Create `components/ui/Container.tsx`**

```tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ContainerSize = "sm" | "md" | "lg" | "xl";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: ContainerSize;
}

const sizeClasses: Record<ContainerSize, string> = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
};

export function Container({ size = "lg", className, children, ...props }: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full px-6 sm:px-8 lg:px-10", sizeClasses[size], className)} {...props}>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Create `components/ui/Divider.tsx`**

```tsx
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type DividerProps = HTMLAttributes<HTMLDivElement>;

export function Divider({ className, ...props }: DividerProps) {
  return <div role="separator" className={cn("h-px w-full bg-border", className)} {...props} />;
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/ui/Container.tsx components/ui/Divider.tsx
git commit -m "feat(ui): add Container (sm/md/lg/xl) and Divider primitives"
```

---

## Task 9: `components/ui` barrel

**Files:**
- Create: `components/ui/index.ts`

**Interfaces:**
- Consumes: every component + type from Tasks 2–8.
- Produces: single import surface `@/components/ui` used by all domain components and the demo page.

- [ ] **Step 1: Create `components/ui/index.ts`**

```ts
export { Button } from "./Button";
export type { ButtonProps, ButtonVariant } from "./Button";

export { Card } from "./Card";
export type { CardProps, CardPadding } from "./Card";

export { Badge } from "./Badge";
export type { BadgeProps, BadgeVariant } from "./Badge";

export { Input } from "./Input";
export type { InputProps } from "./Input";

export { StatusIndicator } from "./StatusIndicator";
export type { StatusIndicatorProps, ConnectionState } from "./StatusIndicator";

export { Container } from "./Container";
export type { ContainerProps, ContainerSize } from "./Container";

export { Divider } from "./Divider";
export type { DividerProps } from "./Divider";

export { LoadingDots } from "./LoadingDots";
export type { LoadingDotsProps } from "./LoadingDots";
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/ui/index.ts
git commit -m "feat(ui): add barrel export for components/ui"
```

---

## Task 10: Chat — `ConnectionStatus` + `ChatHeader`

**Files:**
- Create: `components/chat/ConnectionStatus.tsx`
- Create: `components/chat/ChatHeader.tsx`

**Interfaces:**
- Consumes: `StatusIndicator`, `ConnectionState` from `@/components/ui`.
- Produces: `ConnectionStatus`, `ConnectionStatusProps { status: ConnectionState }` from `components/chat/ConnectionStatus.tsx`; `ChatHeader`, `ChatHeaderProps { title: string; status: ConnectionState }` from `components/chat/ChatHeader.tsx`. `ChatHeader` is consumed by the `/chat` page (Task 15).

- [ ] **Step 1: Create `components/chat/ConnectionStatus.tsx`**

```tsx
import { StatusIndicator } from "@/components/ui";
import type { ConnectionState } from "@/components/ui";

export interface ConnectionStatusProps {
  status: ConnectionState;
}

const labels: Record<ConnectionState, string> = {
  connected: "Live",
  connecting: "Reconnecting…",
  disconnected: "Offline",
};

export function ConnectionStatus({ status }: ConnectionStatusProps) {
  return <StatusIndicator status={status} label={labels[status]} />;
}
```

- [ ] **Step 2: Create `components/chat/ChatHeader.tsx`**

```tsx
import { ConnectionStatus } from "@/components/chat/ConnectionStatus";
import type { ConnectionState } from "@/components/ui";

export interface ChatHeaderProps {
  title: string;
  status: ConnectionState;
}

export function ChatHeader({ title, status }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-border pb-4">
      <h2 className="text-h2 text-text">{title}</h2>
      <ConnectionStatus status={status} />
    </div>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/chat/ConnectionStatus.tsx components/chat/ChatHeader.tsx
git commit -m "feat(chat): add ConnectionStatus and ChatHeader scaffolding"
```

---

## Task 11: Chat — `ChatMessage` + `ChatMessages`

**Files:**
- Create: `components/chat/ChatMessage.tsx`
- Create: `components/chat/ChatMessages.tsx`

**Interfaces:**
- Consumes: `cn` from `lib/utils.ts`.
- Produces: `ChatMessage`, `ChatMessageProps { message: ChatMessageData }`, `ChatMessageData { id: string; author: "user" | "assistant"; text: string; time: string }`, `ChatMessageAuthor` from `components/chat/ChatMessage.tsx`; `ChatMessages`, `ChatMessagesProps { messages: ChatMessageData[] }` from `components/chat/ChatMessages.tsx`. `ChatMessageData` is the shape Task 14's mock data and Task 15's page must use.

- [ ] **Step 1: Create `components/chat/ChatMessage.tsx`**

```tsx
import { cn } from "@/lib/utils";

export type ChatMessageAuthor = "user" | "assistant";

export interface ChatMessageData {
  id: string;
  author: ChatMessageAuthor;
  text: string;
  time: string;
}

export interface ChatMessageProps {
  message: ChatMessageData;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.author === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-card px-4 py-3 text-body",
          isUser ? "bg-primary text-surface" : "bg-surface-secondary text-text",
        )}
      >
        <p>{message.text}</p>
        <span className={cn("mt-1 block text-caption", isUser ? "text-surface/70" : "text-text-muted")}>
          {message.time}
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `components/chat/ChatMessages.tsx`**

```tsx
import { ChatMessage } from "@/components/chat/ChatMessage";
import type { ChatMessageData } from "@/components/chat/ChatMessage";

export interface ChatMessagesProps {
  messages: ChatMessageData[];
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  return (
    <div className="flex flex-col gap-3 py-4">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/chat/ChatMessage.tsx components/chat/ChatMessages.tsx
git commit -m "feat(chat): add ChatMessage and ChatMessages scaffolding"
```

---

## Task 12: Chat — `ChatComposer`

**Files:**
- Create: `components/chat/ChatComposer.tsx`

**Interfaces:**
- Consumes: `Button`, `Input` from `@/components/ui`; `Send` icon from `lucide-react`.
- Produces: `ChatComposer`, `ChatComposerProps { onSend?(text: string): void; disabled?: boolean; placeholder?: string }` from `components/chat/ChatComposer.tsx`. Owns its own text-field value as local `useState` (UI state, not business logic); calls `onSend` and clears the field on submit. This is the file a later WebSocket hook plugs into via `onSend` — no rewrite needed then.

- [ ] **Step 1: Create `components/chat/ChatComposer.tsx`**

```tsx
"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { Send } from "lucide-react";
import { Button, Input } from "@/components/ui";

export interface ChatComposerProps {
  onSend?: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatComposer({ onSend, disabled = false, placeholder = "Write a message…" }: ChatComposerProps) {
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend?.(trimmed);
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 border-t border-border pt-4">
      <label htmlFor="chat-composer-input" className="sr-only">
        Message
      </label>
      <Input
        id="chat-composer-input"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
      <Button type="submit" disabled={disabled} aria-label="Send message">
        <Send aria-hidden="true" className="h-4 w-4" />
      </Button>
    </form>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/chat/ChatComposer.tsx
git commit -m "feat(chat): add ChatComposer with onSend/disabled props"
```

---

## Task 13: Meetings — `MeetingCard` + `MeetingList`

**Files:**
- Create: `components/meetings/MeetingCard.tsx`
- Create: `components/meetings/MeetingList.tsx`

**Interfaces:**
- Consumes: `Badge`, `BadgeVariant`, `Card`, `Divider` from `@/components/ui`.
- Produces: `MeetingCard`, `MeetingCardProps { meeting: MeetingData }`, `MeetingData { id: string; title: string; time: string; status: MeetingStatus }`, `MeetingStatus = "scheduled" | "completed" | "cancelled"` from `components/meetings/MeetingCard.tsx`; `MeetingList`, `MeetingListProps { title: string; meetings: MeetingData[] }` from `components/meetings/MeetingList.tsx`. The status→`BadgeVariant` mapping lives here (`scheduled`→`neutral`, `completed`→`success`, `cancelled`→`danger`), not inside `Badge`.

- [ ] **Step 1: Create `components/meetings/MeetingCard.tsx`**

```tsx
import { Badge } from "@/components/ui";
import type { BadgeVariant } from "@/components/ui";

export type MeetingStatus = "scheduled" | "completed" | "cancelled";

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
```

- [ ] **Step 2: Create `components/meetings/MeetingList.tsx`**

```tsx
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
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/meetings/MeetingCard.tsx components/meetings/MeetingList.tsx
git commit -m "feat(meetings): add MeetingCard and MeetingList scaffolding"
```

---

## Task 14: Demo mock data

**Files:**
- Create: `app/chat/mock-data.ts`

**Interfaces:**
- Consumes: `MeetingData` from `@/components/meetings/MeetingCard`; `ChatMessageData` from `@/components/chat/ChatMessage`.
- Produces: `mockMeetings: MeetingData[]`, `mockMessages: ChatMessageData[]`, both exported from `app/chat/mock-data.ts`, consumed only by Task 15's page.

- [ ] **Step 1: Create `app/chat/mock-data.ts`**

```ts
import type { MeetingData } from "@/components/meetings/MeetingCard";
import type { ChatMessageData } from "@/components/chat/ChatMessage";

export const mockMeetings: MeetingData[] = [
  { id: "m1", title: "Consultation with Dr. Novak", time: "Today · 14:30", status: "scheduled" },
  { id: "m2", title: "Follow-up check-in", time: "Yesterday · 10:00", status: "completed" },
  { id: "m3", title: "Physiotherapy session", time: "Mon, Aug 3 · 09:15", status: "cancelled" },
];

export const mockMessages: ChatMessageData[] = [
  { id: "c1", author: "assistant", text: "Hi! How can I help you today?", time: "09:41" },
  { id: "c2", author: "user", text: "I'd like to reschedule my appointment.", time: "09:42" },
  { id: "c3", author: "assistant", text: "Sure — which day works best for you?", time: "09:42" },
];
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/chat/mock-data.ts
git commit -m "feat(chat): add static mock data for the /chat demo page"
```

---

## Task 15: Assemble the `/chat` demo page

**Files:**
- Modify: `app/chat/page.tsx` (full rewrite of the current one-line placeholder)

**Interfaces:**
- Consumes: everything produced in Tasks 9–14 (`components/ui` barrel, `ChatHeader`, `ChatMessages`, `ChatComposer`, `MeetingList`, `mockMeetings`, `mockMessages`).
- Produces: the page itself — nothing downstream depends on it.

- [ ] **Step 1: Replace `app/chat/page.tsx`**

```tsx
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
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Visual smoke check**

Run: `npm run dev` (background), then open `http://localhost:3000/chat` in a browser (or use the `agent-browser` skill / `Bash` with `curl -s http://localhost:3000/chat | head -c 500` if no browser is available) and confirm the page renders without a Next.js error overlay.
Expected: page renders the top bar, the two-column grid (meetings card + chat card), and the Developer Preview block. Stop the dev server afterward.

- [ ] **Step 4: Commit**

```bash
git add app/chat/page.tsx
git commit -m "feat(chat): assemble /chat demo page from design system components"
```

---

## Task 16: Final verification

**Files:** none (verification only).

**Interfaces:** none.

- [ ] **Step 1: Run the linter**

Run: `npm run lint`
Expected: zero errors, zero warnings. If anything is reported, fix it in the relevant component file from Tasks 1–15 and re-run.

- [ ] **Step 2: Run the production build**

Run: `npm run build`
Expected: build completes successfully with zero errors and zero warnings (including no TypeScript errors and no Next.js route/type warnings).

- [ ] **Step 3: Commit any fixes**

If Steps 1–2 required changes, stage exactly the changed files and commit:

```bash
git add -A
git commit -m "fix(design-system): resolve lint/build issues"
```

If no changes were needed, skip this step — there is nothing to commit.

---

## Self-review notes

- **Spec coverage:** every token group, every `components/ui` primitive, every `components/chat`/`components/meetings` file, the mock data, the `/chat` page sections (top bar, meetings card, chat card, Developer Preview), and the accessibility/TypeScript/styling/performance/forward-compatibility constraints from the amended spec each map to a task above.
- **Type consistency:** `ConnectionState` is defined once in `StatusIndicator.tsx` and re-exported through the barrel; `ChatMessageData`/`MeetingData` are defined once (in `ChatMessage.tsx` / `MeetingCard.tsx`) and imported everywhere else that needs them (mock data, page) — no parallel/duplicate type definitions.
- **No placeholders:** every step contains complete, final code — nothing marked TBD.

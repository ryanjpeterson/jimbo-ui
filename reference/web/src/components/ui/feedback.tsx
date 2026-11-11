/**
 * Feedback: telling people what happened and what's happening.
 *
 * - `toast()` + `Toaster` — a short, timed note ("Saved", "Deleted · Undo",
 *   "Couldn't start a sync"), top right, under the top bar.
 * - `ConfirmSheet` / `useConfirm` — asks before something destructive or
 *   surprising, in plain words, saying what survives.
 * - `ProgressBar` — how far along a job of known length is.
 * - `JobTile` — one job in a "running now" list: progress and the item it's
 *   on up front, the rest in a compact block; a short finished state.
 * - `Stepper` — where you are in a flow of a few steps.
 * - `OfflineBanner` / `UpdateBanner` — slim bars under the top bar: offline
 *   (with changes waiting), or a new version ready.
 *
 * Built on jimbo.ui's shadcn primitives: sonner, alert-dialog, progress.
 * jimbo-ui reference: copy into an app as is. `Toaster` goes in the app shell once.
 */

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { toast as sonner } from "sonner";
import { CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge, type Tone } from "@/components/ui/kit";
import { cn } from "@/lib/cn";

// ─────────────────────────────────────────────────────────────────────────────
// Toasts (shadcn Sonner)
// ─────────────────────────────────────────────────────────────────────────────

export type ToastTone = "done" | "info" | "error";

export type ToastInput = {
  title: string;
  body?: ReactNode;
  /** done (primary dot, the default), info (support) or error (highlight; stays longest). */
  tone?: ToastTone;
  /** One action — usually Undo. */
  action?: { label: string; onClick: () => void };
  /** Milliseconds on screen. Defaults: 4 s, 6 s with an action, 8 s for an error. */
  duration?: number;
};

const TOAST_DOT: Record<ToastTone, string> = { done: "dot-primary", info: "dot-support", error: "dot-highlight" };

const toastDuration = (t: ToastInput) =>
  t.duration ?? (t.tone === "error" ? 8000 : t.action ? 6000 : 4000);

/**
 * Shows a toast; returns a function that closes it. Works from anywhere — no
 * hook needed. Every toast is timed (errors too, just longer), and hovering
 * holds it. Three at most.
 */
export function toast(input: ToastInput | string): () => void {
  const t = typeof input === "string" ? { title: input } : input;
  const tone = t.tone ?? "done";
  const id = sonner(t.title, {
    description: t.body,
    duration: toastDuration(t),
    icon: <span aria-hidden="true" className={cn(TOAST_DOT[tone], "h-2.5 w-2.5")} />,
    action: t.action ? { label: t.action.label, onClick: t.action.onClick } : undefined,
    closeButton: true,
  });
  return () => dismissToast(id);
}

export function dismissToast(id: string | number) {
  sonner.dismiss(id);
}

/**
 * Where toasts appear (M4): the top right corner, just under the top bar
 * (`--top-bar`), so they never cover the dock, a pinned save bar or the
 * thing just tapped. Newest on top. Put it in the app shell once.
 */
export function Toaster() {
  return <SonnerToaster visibleToasts={3} offset={{ top: "calc(var(--top-bar) + 0.5rem)", right: "calc(1rem + var(--safe-right))" }}
    mobileOffset={{ top: "calc(var(--top-bar) + 0.5rem)", left: "calc(0.75rem + var(--safe-left))", right: "calc(0.75rem + var(--safe-right))" }} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// Confirm
// ─────────────────────────────────────────────────────────────────────────────

export type ConfirmOptions = {
  title: string;
  /** What happens, and what survives ("Its entries stay in your list"). */
  body?: ReactNode;
  /** The action in its own words: "Delete list", never "OK" or "Yes". */
  confirmLabel: string;
  cancelLabel?: string;
  /** Destructive: the button takes the highlight fill and Cancel gets the focus. */
  danger?: boolean;
};

/**
 * Asks before a destructive or surprising action (M5), as a shadcn
 * AlertDialog: the question, a line on what happens and what survives, then
 * Cancel and the action named in its own words. Cancel has the focus when
 * it's `danger`. `busy` while the action runs.
 */
export function ConfirmSheet({ title, body, confirmLabel, cancelLabel = "Cancel", danger = false, busy = false, onConfirm, onClose }: ConfirmOptions & {
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <AlertDialog open onOpenChange={(o) => { if (!o && !busy) onClose(); }}>
      <AlertDialogContent onOpenAutoFocus={danger ? undefined : (e) => { e.preventDefault(); (e.currentTarget as HTMLElement).querySelector<HTMLButtonElement>("[data-confirm]")?.focus(); }}>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-xl">{title}</AlertDialogTitle>
          {body ? <AlertDialogDescription className="text-15">{body}</AlertDialogDescription> : <AlertDialogDescription className="sr-only">{title}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>{cancelLabel}</AlertDialogCancel>
          <Button data-confirm variant={danger ? "destructive" : "default"} onClick={onConfirm} loading={busy}>{confirmLabel}</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * `const [confirm, confirmSheet] = useConfirm()` — render `confirmSheet`
 * once, then `if (await confirm({ title, confirmLabel, danger: true })) …`.
 */
export function useConfirm(): [(options: ConfirmOptions) => Promise<boolean>, ReactNode] {
  const [ask, setAsk] = useState<(ConfirmOptions & { resolve: (ok: boolean) => void }) | null>(null);
  const confirm = (options: ConfirmOptions) => new Promise<boolean>((resolve) => setAsk({ ...options, resolve }));
  const done = (ok: boolean) => { ask?.resolve(ok); setAsk(null); };
  const sheet = ask ? <ConfirmSheet {...ask} onConfirm={() => done(true)} onClose={() => done(false)} /> : null;
  return [confirm, sheet];
}

// ─────────────────────────────────────────────────────────────────────────────
// Progress
// ─────────────────────────────────────────────────────────────────────────────

const BAR_TONE = { accent: "primary", primary: "primary", support: "support", highlight: "highlight" } as const;

/**
 * How far along a job of known length is (an upload, an import, a quota):
 * a flat bar (shadcn `Progress`) in the tone over a muted track, the label
 * and value above. No `value` is "working, length unknown" — a slow sweep.
 * For background work that shouldn't take a whole row, use the corner ring
 * (guide section 9).
 */
export function ProgressBar({ label, value, max = 100, tone = "primary", format, hideLabel = false, size = "md", className }: {
  label: string;
  /** Leave out while the length is unknown. */
  value?: number;
  max?: number;
  tone?: keyof typeof BAR_TONE;
  /** How the value reads: "42%" by default. */
  format?: (value: number, max: number) => string;
  /** Keep the label for screen readers only. */
  hideLabel?: boolean;
  /** `lg`: a thicker bar, for the one job a tile is about (`JobTile`). */
  size?: "md" | "lg";
  /** Layout only (J3). */
  className?: string;
}) {
  const known = value != null;
  const pct = known ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const text = known ? (format ? format(value, max) : `${Math.round(pct)}%`) : "Working…";
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className={cn("flex items-baseline justify-between gap-3 text-sm", hideLabel && "sr-only")}>
        <span className="min-w-0 truncate font-semibold text-muted-foreground">{label}</span>
        <span className="shrink-0 tabular-nums text-subtle-foreground">{text}</span>
      </div>
      <Progress aria-label={label} aria-valuetext={text} value={known ? pct : null} tone={BAR_TONE[tone]} size={size} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Job tiles
// ─────────────────────────────────────────────────────────────────────────────

export type JobState = "running" | "queued" | "paused" | "done" | "failed";

const JOB_STATE: Record<JobState, { tone: Tone; label: string; live?: boolean }> = {
  running: { tone: "accent", label: "Running", live: true },
  queued: { tone: "muted", label: "Queued" },
  paused: { tone: "yellow", label: "Paused" },
  done: { tone: "accent", label: "Done" },
  failed: { tone: "red", label: "Failed" },
};

/**
 * One job in a "running now" list, made for `List layout="tiles"` (which
 * gives it its card; in rows it's a roomy row). While it runs, what matters
 * most comes first and biggest: how far along it is (a large percentage,
 * the count beside it, a thick `ProgressBar`) and the item it's on, on an
 * accent wash in readable type ("Now · Some item"). The rest — speed, time
 * left, when it last reported — sits in a compact block of `facts` at the
 * bottom, lined up across tiles. Finished, failed or queued, it shrinks to
 * its name, a status badge and its `note`. Long text wraps; nothing here
 * is cut with an ellipsis.
 */
export function JobTile({ title, state = "running", value, max = 100, count, current, currentLabel = "Now", facts, note, stateLabel, action, className }: {
  title: ReactNode;
  state?: JobState;
  /** Done so far, of `max`. Leave out while the length is unknown. */
  value?: number;
  max?: number;
  /** Beside the percentage: "57 of 3,384". Defaults to `value` of `max`. */
  count?: ReactNode;
  /** The item it's working on right now. */
  current?: ReactNode;
  currentLabel?: string;
  /** Secondary facts (speed, time left, updated), a compact block at the bottom. */
  facts?: { label: string; value: ReactNode }[];
  /** A line of detail: the stage while running, what happened once finished (a failure's reason). Wraps. */
  note?: ReactNode;
  /** Replaces the badge's word ("Done 3 min ago"). */
  stateLabel?: string;
  /** One small control (Pause, Cancel, a ⋯ `Menu`). */
  action?: ReactNode;
  className?: string;
}) {
  const s = JOB_STATE[state];
  const name = typeof title === "string" ? title : "Progress";
  const header = (
    <div className="flex items-start gap-3">
      <p className="min-w-0 flex-1 break-words text-15 font-semibold leading-snug text-foreground">{title}</p>
      <Badge tone={s.tone} dot live={s.live} className="mt-0.5 shrink-0">{stateLabel ?? s.label}</Badge>
      {action}
    </div>
  );
  const factBlock = facts && facts.length > 0 && (
    <dl className="mt-auto flex flex-wrap gap-x-5 gap-y-2 border-t border-border pt-3">
      {facts.map((f) => (
        <div key={f.label} className="min-w-0">
          <dt className="text-11 font-semibold uppercase tracking-wider text-subtle-foreground">{f.label}</dt>
          <dd className="break-words text-sm font-semibold text-foreground">{f.value}</dd>
        </div>
      ))}
    </dl>
  );

  if (state === "done" || state === "failed" || state === "queued") {
    return (
      <div className={cn("flex h-full flex-col gap-2 p-4 sm:p-5", className)}>
        {header}
        {/* Muted, not highlight: highlight text on a card can drop under 3:1 in some looks; the badge says it failed. */}
        {note && <p className="break-words text-sm text-muted-foreground">{note}</p>}
        {factBlock}
      </div>
    );
  }

  const known = value != null;
  const pct = known ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const shown = pct > 0 && pct < 10 ? pct.toFixed(1) : Math.round(pct).toString();
  const countText = count ?? (known ? `${value.toLocaleString()} of ${max.toLocaleString()}` : null);
  return (
    <div className={cn("flex h-full flex-col gap-3 p-4 sm:p-5", className)}>
      {header}
      <div>
        <p className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          {known
            ? <span className="font-display text-40 leading-none text-foreground">{shown}%</span>
            : <span className="font-display text-28 leading-none text-muted-foreground">Working…</span>}
          {countText && <span className="text-sm font-medium text-muted-foreground">{countText}</span>}
        </p>
        <ProgressBar label={name} hideLabel size="lg" value={value} max={max} className="mt-3" />
      </div>
      {current && (
        // The item it's on: readable type on a primary wash (text on primary-950 is ≥ 6.5:1 in every look).
        <div className="rounded-xl bg-primary-950 px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-11 font-semibold uppercase tracking-wider text-foreground">
            <span aria-hidden="true" className={cn("dot-primary h-2 w-2 shrink-0", state === "running" && "animate-pulse")} />
            {currentLabel}
          </p>
          <p className="mt-1 break-words text-15 font-semibold leading-snug text-foreground">{current}</p>
        </div>
      )}
      {note && <p className="break-words text-sm text-muted-foreground">{note}</p>}
      {factBlock}
    </div>
  );
}

/**
 * Where you are in a flow of two to five steps (set up, details, review):
 * numbered circles joined by a line — done ones ticked in an accent wash,
 * the current one a flat accent fill. Labels show from `sm:` up; phones get
 * "Step 2 of 4 · Details" under the circles. `onStep` lets people go back to
 * a step they've done.
 */
export function Stepper({ steps, current, onStep }: { steps: string[]; current: number; onStep?: (index: number) => void }) {
  return (
    <nav aria-label="Progress" className="space-y-2">
      <ol className="flex items-center">
        {steps.map((s, i) => {
          const state = i < current ? "done" : i === current ? "current" : "next";
          const circle = (
            <span className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold tabular-nums transition-colors",
              state === "done" && "bg-primary-950 text-primary",
              state === "current" && "bg-primary text-primary-foreground",
              state === "next" && "border border-border bg-muted text-subtle-foreground",
            )}>
              {state === "done" ? <CheckIcon aria-hidden="true" className="size-3.5" strokeWidth={3.5} /> : i + 1}
            </span>
          );
          const label = <span className={cn("hidden text-sm font-semibold sm:inline", state === "next" ? "text-subtle-foreground" : "text-foreground")}>{s}</span>;
          return (
            <li key={s} aria-current={state === "current" ? "step" : undefined} className={cn("flex items-center", i < steps.length - 1 && "flex-1")}>
              {onStep && state === "done"
                ? <button type="button" onClick={() => onStep(i)} className="-m-1.5 flex items-center gap-2 rounded-full p-1.5 transition-colors hover:bg-muted sm:pr-3">{circle}{label}<span className="sr-only">(done, go back)</span></button>
                : <span className="flex items-center gap-2">{circle}{label}{state === "done" && <span className="sr-only">(done)</span>}</span>}
              {i < steps.length - 1 && <span aria-hidden="true" className={cn("mx-2 h-0.5 min-w-4 flex-1 rounded-full sm:mx-3", i < current ? "bg-primary" : "bg-border")} />}
            </li>
          );
        })}
      </ol>
      <p className="text-sm text-muted-foreground sm:hidden">Step {current + 1} of {steps.length} · <span className="font-semibold text-foreground">{steps[current]}</span></p>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Banners under the top bar
// ─────────────────────────────────────────────────────────────────────────────

/** Whether the browser is online, kept up to date. */
export function useOnline(): boolean {
  return useSyncExternalStore(
    (l) => { addEventListener("online", l); addEventListener("offline", l); return () => { removeEventListener("online", l); removeEventListener("offline", l); }; },
    () => navigator.onLine,
    () => true,
  );
}

/** A slim bar that sticks under the top bar (z 30): one line and an optional action. */
function TopBanner({ className, dot, children, action }: { className: string; dot: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div role="status" className={cn("sticky top-[var(--top-bar)] z-30 -mx-4 -mt-6 mb-6 flex min-h-11 items-center gap-3 px-4 py-1.5 text-sm font-semibold sm:-mx-6 sm:-mt-8 sm:mb-8 sm:px-6", className)}>
      <span aria-hidden="true" className={cn("h-2 w-2 shrink-0 rounded-full", dot)} />
      <p className="min-w-0 flex-1">{children}</p>
      {action}
    </div>
  );
}

/**
 * Says the app is offline, and how many changes are waiting to go. Fixed
 * yellow — it carries meaning, so it isn't themed. Shows itself while
 * offline, or while `pending` > 0 after coming back (sending). First thing
 * inside the shell's page, above the page header.
 */
export function OfflineBanner({ pending = 0, forceOffline }: {
  /** Changes made offline, not yet sent. */
  pending?: number;
  /** For previews: show it as offline. */
  forceOffline?: boolean;
}) {
  const online = useOnline() && !forceOffline;
  if (online && pending === 0) return null;
  const waiting = pending > 0 ? `${pending} ${pending === 1 ? "change" : "changes"} ${online ? "sending…" : "waiting to send"}` : null;
  return (
    <TopBanner className="bg-yellow-950 text-yellow-200" dot={online ? "bg-yellow-400 animate-pulse" : "bg-yellow-400"}>
      {online ? waiting : <>You're offline{waiting ? ` · ${waiting}` : " · changes will send when you're back"}</>}
    </TopBanner>
  );
}

/**
 * A new version is ready: one line and Reload. From the service worker's
 * "waiting" event (or a version check); `onReload` activates it and reloads.
 * Dismissable — it asks again next launch.
 */
export function UpdateBanner({ onReload, onDismiss }: { onReload: () => void; onDismiss?: () => void }) {
  return (
    <TopBanner className="border-b border-border bg-card" dot="dot-support"
      action={<span className="flex shrink-0 items-center gap-1">
        {onDismiss && <Button variant="ghost" size="sm" onClick={onDismiss}>Later</Button>}
        <Button size="sm" onClick={onReload}>Reload</Button>
      </span>}>
      A new version is ready
    </TopBanner>
  );
}

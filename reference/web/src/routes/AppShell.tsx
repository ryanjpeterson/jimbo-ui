/**
 * The app shell: a sticky, solid top bar (the app's name, tabs as text links on
 * desktop, round action buttons), the page frame, pull to refresh, the
 * floating tab dock on phones, and where toasts appear (Toaster).
 *
 * jimbo-ui reference: an app passes its tabs (five at most), its top-bar
 * actions and its routes as children.
 */

import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Link, NavLink, useLocation } from "react-router-dom";
import { HeaderTitle } from "@/components/HeaderTitle";
import { Toaster } from "@/components/ui/feedback";
import { useRememberPages } from "@/components/ui/kit";
import { usePullToRefresh } from "@/lib/gestures";
import { cn } from "@/lib/cn";

export interface ShellTab {
  to: string;
  /** One word. */
  label: string;
  /** The icon's SVG shapes (paths, circles…) on a 24×24 grid; the dock draws the frame. */
  icon: ReactNode;
  /** Other paths that belong to this tab. */
  also?: string[];
}

const WIDTHS = { column: "max-w-5xl", wide: "max-w-7xl", full: "max-w-none" } as const;
/** The same widths as a CSS value: full-width heroes (FullBleed) line their content up with the page column. */
const PAGE_MAX = { column: "64rem", wide: "80rem", full: "none" } as const;

export function AppShell({ tabs, actions, onRefresh, width = "column", children }: {
  tabs: ShellTab[];
  /** Page width: the reading column (default), wide (dashboards, galleries) or the full screen. */
  width?: keyof typeof WIDTHS;
  /** Round buttons on the right of the top bar — use TopBarButton. */
  actions?: ReactNode;
  /** Pull to refresh at the top of any page; omit to turn it off. */
  onRefresh?: () => Promise<unknown>;
  children: ReactNode;
}) {
  const location = useLocation();
  useRememberPages(); // so Back lands on a page as it was left (BackButton)
  const { pull, refreshing } = usePullToRefresh(onRefresh ?? (async () => {}));
  const inTab = (t: ShellTab) =>
    [t.to, ...(t.also ?? [])].some((p) => (p === "/" ? location.pathname === "/" : location.pathname.startsWith(p)));

  return (
    // A column at least the screen's height, so main (and a Page in it) can fill what's left
    <div className="flex min-h-[100dvh] flex-col overflow-x-clip" style={{ "--page-max": PAGE_MAX[width] } as CSSProperties}>
      {/* Top padding is --safe-top: 0 under the installed app's solid status bar, the notch
          wherever the page is drawn under it, so nothing sits under the status bar. */}
      <header className="sticky top-0 z-40 border-b border-border bg-background pt-[var(--safe-top)]">
        <div className={cn("mx-auto flex h-14 items-center justify-between gap-4 px-4 sm:h-16 sm:px-6", WIDTHS[width])}>
          <div className="flex h-full items-center gap-8">
            <Link to="/" aria-label="Home"><HeaderTitle /></Link>
            {/* Desktop: bold links with an accent underline on the active one. */}
            <nav className="hidden h-full items-stretch gap-6 sm:flex">
              {tabs.filter((t) => t.to !== "/").map((t) => (
                <NavLink key={t.to} to={t.to}
                  className={cn(
                    "relative flex items-center text-15 font-semibold transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:rounded-t after:transition-colors",
                    inTab(t) ? "text-foreground after:bg-primary" : "text-muted-foreground hover:text-foreground after:bg-transparent",
                  )}>
                  {t.label}
                </NavLink>
              ))}
            </nav>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </header>

      {/* Pull-to-refresh indicator, sliding down from under the top bar. */}
      {onRefresh && (pull > 0 || refreshing) && (
        <div aria-hidden className="pointer-events-none fixed inset-x-0 z-30 flex justify-center"
          style={{ top: `calc(var(--top-bar) + ${Math.round(Math.min(pull, 1) * 56)}px - 40px)` }}>
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card" style={{ opacity: Math.min(pull, 1) }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
              className={refreshing ? "animate-spin text-primary" : pull >= 1 ? "text-primary" : "text-muted-foreground"}
              style={refreshing ? undefined : { transform: `rotate(${pull * 270}deg)` }}>
              <path d="M21 12a9 9 0 1 1-3-6.7L21 8" /><path d="M21 3v5h-5" />
            </svg>
          </div>
        </div>
      )}

      <main className={cn("mx-auto flex w-full flex-1 flex-col px-4 pt-6 pb-[var(--dock-space)] sm:px-6 sm:pt-8", WIDTHS[width])}>{children}</main>

      {/* Phones: a floating, solid dock above the home indicator; content fades out behind it. */}
      <div aria-hidden className="pointer-events-none fixed inset-x-0 bottom-0 z-30 h-[calc(6rem+var(--safe-bottom))] bg-linear-to-t from-background via-background/70 to-transparent sm:hidden" />
      <nav aria-label="Main" className="pointer-events-none fixed inset-x-0 bottom-0 z-40 select-none pb-[calc(0.75rem+var(--safe-bottom))] pl-[calc(0.75rem+var(--safe-left))] pr-[calc(0.75rem+var(--safe-right))] sm:hidden">
        <div className="pointer-events-auto mx-auto grid max-w-md gap-1 rounded-2xl border border-border bg-card p-1.5"
          style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
          {tabs.map((t) => {
            const active = inTab(t);
            return (
              <NavLink key={t.to} to={t.to} end={t.to === "/"} aria-current={active ? "page" : undefined}
                onClick={(e) => {
                  // Tapping the tab you're on scrolls back to the top, like a native app.
                  if (location.pathname === t.to) { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }
                }}
                className={cn(
                  "relative flex h-14 flex-col items-center justify-center gap-0.5 rounded-xl transition-[background-color,color,transform] duration-200 active:scale-[0.92]",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground active:bg-accent",
                )}>
                <DockIcon active={active}>{t.icon}</DockIcon>
                <span className={cn("text-10.5 tracking-wide", active ? "font-bold" : "font-semibold")}>{t.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      <Toaster />
    </div>
  );
}

/** A 24 px line icon; active ones get a soft fill, like filled tab-bar symbols on iOS. */
export function DockIcon({ active = false, children }: { active?: boolean; children: ReactNode }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.22 : undefined}
      stroke="currentColor" strokeWidth={active ? 2.2 : 1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

/**
 * A top-bar icon button (shadcn `Button size="icon"`): secondary on the bar,
 * or the primary fill for the main action. Takes a trigger's props (a
 * `JumpMenu`'s ☰), and forwards its ref.
 */
export function TopBarButton({ label, primary = false, children, ...props }: Omit<ComponentProps<typeof Button>, "variant" | "size"> & {
  label: string;
  primary?: boolean;
  /** An 18 px icon. */
  children: ReactNode;
}) {
  return (
    <Button variant={primary ? "default" : "secondary"} size="icon" aria-label={label} title={label}
      className={primary ? undefined : "bg-card text-muted-foreground hover:text-foreground"} {...props}>
      {children}
    </Button>
  );
}

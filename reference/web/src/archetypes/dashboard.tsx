/**
 * Archetype: Single-page dashboard — one screen that answers "is everything
 * fine?", lists the jobs it watches with a button each, the recent runs, and
 * how it's set up. Remix it: the jobs can be reports, syncs, checks, builds.
 *
 * Shape: one page (dock tabs optional: Home · Runs · Settings, at most three),
 * plus the jimbo-ui config section under Settings.
 *   A verdict line (accent when fine, highlight when something needs a look)
 *   StatGrid of the headline numbers
 *   Section of job rows: status dot (pulsing while running), last run, Run button, errors inline
 *   Section of recent runs as EventRow; a run opens its log in a Sheet (?run=…)
 *   Section of read-only settings as label / value rows
 */

import { useSearchParams } from "react-router-dom";
import { EventRow, KeyValue, LIVE, PageHeader, Section, Sheet, STATUS_DOT, StatGrid, StatTile, TONES, type Tone } from "@/components/ui/kit";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type Job = { id: string; name: string; from: string; status: "ok" | "running" | "failed" | "never"; last: string; error?: string };
const STATUS: Record<Job["status"], { tone: Tone; label: string }> = {
  ok: { tone: "accent", label: "Fine" },
  running: { tone: "yellow", label: "Running" },
  failed: { tone: "red", label: "Failed" },
  never: { tone: "muted", label: "Never run" },
};

const JOBS: Job[] = [
  { id: "a", name: "Nightly report", from: "to the team inbox", status: "ok", last: "Sent 2 hours ago · took 4 min" },
  { id: "b", name: "Sync the shared folder", from: "with the cloud", status: "running", last: "Running since 10:42" },
  { id: "c", name: "Check the website", from: "every hour", status: "failed", last: "Failed yesterday", error: "The site didn't answer." },
];
const RUNS = [
  { id: "r1", date: "2026-10-30", title: "Sync the shared folder", sub: "Started 10:42 · 1,204 files", running: true },
  { id: "r2", date: "2026-10-30", title: "Nightly report", sub: "Started 08:00 · 3 pages", running: false },
  { id: "r3", date: "2026-10-29", title: "Check the website", sub: "Started 22:00 · failed", running: false },
];

export function DashboardPage() {
  // A run's log opens from its row (?run=…), so Back closes it.
  const [params, setParams] = useSearchParams();
  const log = RUNS.find((r) => r.id === params.get("run")) ?? null;
  const trouble = JOBS.filter((j) => j.status === "failed").length;
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Dashboard" title="All jobs" />
      <p className={cn("-mt-3 text-[15px] font-semibold", trouble ? "text-highlight" : "text-accent")}>
        {trouble ? `${trouble === 1 ? "One job needs" : `${trouble} jobs need`} a look.` : "Everything's fine."}
      </p>

      <StatGrid>
        <StatTile label="Jobs" value={JOBS.length} accent="accent" />
        <StatTile label="Runs this week" value={21} accent="support" />
        <StatTile label="Uptime" value="99%" />
        <StatTile label="Failed" value={trouble} accent="highlight" />
      </StatGrid>

      <Section title="Jobs" count={JOBS.length} flush>
        <div className="divide-etched">
          {JOBS.map((j) => (
            <div key={j.id} className="flex items-start gap-3 px-4 py-3.5">
              <span title={STATUS[j.status].label} aria-label={STATUS[j.status].label}
                className={cn(STATUS_DOT, "mt-1.5", TONES[STATUS[j.status].tone].dot, j.status === "running" && LIVE)} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold">{j.name}</span>
                <span className="block text-sm text-text-muted">{j.from}</span>
                <span className={cn("mt-0.5 block text-sm", j.error ? "text-highlight" : "text-text-subtle")}>{j.error ? `Can't run: ${j.error}` : j.last}</span>
              </span>
              <Button size="sm" variant="secondary" disabled={j.status === "running" || !!j.error}>Run</Button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Recent runs" count={RUNS.length} flush>
        <div className="divide-etched">
          {RUNS.map((r) => (
            <EventRow key={r.id} onOpen={() => setParams({ run: r.id })} date={r.date} title={r.title} subtitle={r.sub}
              status={r.running ? { tone: "yellow", label: "Running", live: true } : null} />
          ))}
        </div>
      </Section>

      <Section title="How it runs" flush>
        <div className="divide-etched">
          <KeyValue label="Schedule">Every night at 22:00</KeyValue>
          <KeyValue label="Keeps">30 days of logs</KeyValue>
          <KeyValue label="Notifies">On failures only</KeyValue>
        </div>
      </Section>

      {log && (
        <Sheet wide title={log.title} subtitle={log.sub} onClose={() => setParams({}, { replace: true })}>
          <div className="p-4 sm:p-5">
            <pre className="whitespace-pre-wrap break-words rounded-xl border border-border bg-bg-deep/80 p-3 font-mono text-[12px] leading-relaxed text-text-muted">
              {"10:42:01  Starting\n10:42:03  Comparing both sides\n10:42:05  Syncing 1,204 files\n…"}
            </pre>
          </div>
        </Sheet>
      )}
    </div>
  );
}

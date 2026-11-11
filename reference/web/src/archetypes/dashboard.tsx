/**
 * Archetype: Single-page dashboard — one screen that answers "is everything
 * fine?", lists the jobs it watches with a button each, the recent runs, and
 * how it's set up. Remix it: the jobs can be reports, syncs, checks, builds.
 *
 * Shape: one page (dock tabs optional: Home · Runs · Settings, at most three),
 * plus the jimbo-ui config section under Settings.
 *   A verdict line (accent when fine, highlight when something needs a look)
 *   StatGrid of the headline numbers, each with a Sparkline of its recent values
 *   Running now — JobTile in List layout="tiles": progress and the item it's
 *     on up front, speed / time left / updated below; finished ones compact
 *   Section of jobs — as rows or tiles (LayoutSwitch, remembered): status dot
 *     (pulsing while running), last run, Run button, errors inline
 *   Charts side by side in Columns (one size per row): runs per day
 *     (BarChart, vertical, with a line under it) and how long runs took (TrendChart)
 *   Section of recent runs as EventRow; a run opens its log in a Sheet (?run=…)
 *   Section of read-only settings as label / value rows
 */

import { useSearchParams } from "react-router-dom";
import {
  BarChart, Columns, EventRow, KeyValue, LayoutSwitch, List, LIVE, PageHeader, Section, Sheet, STATUS_DOT, StatGrid, StatTile, TONES, TrendChart, useListLayout, type Tone,
} from "@/components/ui/kit";
import { Button } from "@/components/ui/button";
import { JobTile } from "@/components/ui/feedback";
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
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const RUNS_PER_DAY = [3, 4, 2, 5, 3, 1, 3];
const DATES = Array.from({ length: 14 }, (_, i) => `Oct ${17 + i}`);
const MINUTES = {
  report: [4, 4, 5, 4, 6, 5, 4, 4, 5, 7, 5, 4, 4, 4],
  sync: [11, 9, 12, 14, 10, 9, 13, 18, 15, 12, 11, 16, 14, 12],
};

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
  const [layout, setLayout] = useListLayout("dashboard-jobs");
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Dashboard" title="All jobs" />
      <p className={cn("-mt-3 text-15 font-semibold", trouble ? "text-highlight" : "text-primary")}>
        {trouble ? `${trouble === 1 ? "One job needs" : `${trouble} jobs need`} a look.` : "Everything's fine."}
      </p>

      <StatGrid>
        <StatTile label="Jobs" value={JOBS.length} accent="accent" />
        <StatTile label="Runs this week" value={21} accent="support" trend={[14, 18, 16, 19, 17, 22, 21]} />
        <StatTile label="Uptime" value="99%" trend={[97, 99, 98, 100, 99, 99, 99]} />
        <StatTile label="Failed" value={trouble} accent="highlight" trend={[0, 0, 2, 1, 0, 0, 1]} />
      </StatGrid>

      <Section title="Running now" count={3} plain>
        <List layout="tiles">
          <JobTile title="Sync the shared folder" value={1204} max={3480} current="Photos / 2026 / October / harbour-at-dusk.jpg"
            facts={[{ label: "Speed", value: "4.2 files/s" }, { label: "Left", value: "about 9 min" }, { label: "Updated", value: "just now" }]} />
          <JobTile title="Nightly report" state="done" stateLabel="Done 08:04"
            note="Sent to the team inbox: three pages, the week's numbers and the two runs that took longest." />
          <JobTile title="Check the website" state="failed" stateLabel="Failed 22:00"
            note="The site didn't answer after three tries, so the hourly check stopped until someone runs it again." />
        </List>
      </Section>

      <Section title="Jobs" count={JOBS.length} action={<LayoutSwitch value={layout} onChange={setLayout} />} plain>
        <List layout={layout}>
          {JOBS.map((j) => (
            <div key={j.id} className="flex h-full items-start gap-3 px-4 py-3.5">
              <span title={STATUS[j.status].label} aria-label={STATUS[j.status].label}
                className={cn(STATUS_DOT, "mt-1.5", TONES[STATUS[j.status].tone].dot, j.status === "running" && LIVE)} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-15 font-semibold">{j.name}</span>
                <span className="block text-sm text-muted-foreground">{j.from}</span>
                <span className={cn("mt-0.5 block text-sm", j.error ? "text-highlight" : "text-subtle-foreground")}>{j.error ? `Can't run: ${j.error}` : j.last}</span>
              </span>
              <Button size="sm" variant="secondary" disabled={j.status === "running" || !!j.error}>Run</Button>
            </div>
          ))}
        </List>
      </Section>

      <Columns>
        <Section title="Runs this week">
          <BarChart direction="vertical" tone="support" title="Runs per day this week"
            items={DAYS.map((d, i) => ({ id: d, label: d, value: RUNS_PER_DAY[i]! }))} />
          <p className="mt-3 text-sm text-muted-foreground">Busiest: Thursday (5), Tuesday (4).</p>
        </Section>
        <Section title="Minutes per run">
          <TrendChart labels={DATES} title="Minutes per run, last two weeks" format={(n) => `${n}m`}
            series={[{ label: "Sync", values: MINUTES.sync }, { label: "Report", values: MINUTES.report }]} />
        </Section>
      </Columns>

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
            <pre className="whitespace-pre-wrap break-words rounded-xl border border-border bg-background-deep/80 p-3 font-mono text-12 leading-relaxed text-muted-foreground">
              {"10:42:01  Starting\n10:42:03  Comparing both sides\n10:42:05  Syncing 1,204 files\n…"}
            </pre>
          </div>
        </Sheet>
      )}
    </div>
  );
}

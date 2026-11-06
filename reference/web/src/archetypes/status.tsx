/**
 * Archetype: Status monitor — the services you run, whether each one is up,
 * how fast it answers and how it's reached, with a way into each. Remix it:
 * the services can be self-hosted apps, sites, devices or APIs.
 *
 * Shape: one page (dock tabs optional: Status · Settings), plus the jimbo-ui
 * config section under Settings.
 *   PageHeader, then the connection the services go out through: a Section of
 *     label / value rows with a status Badge in its action slot
 *   StatGrid: how many are up, average response, uptime and checks, with trends
 *   Section of services — as rows or tiles (LayoutSwitch, remembered): status
 *     dot, name and what it is, how it's reached, its last answer, the recent
 *     checks as a row of dots, and an Open button (disabled while it's down)
 *   History over a range (Tabs size="sm"): uptime and response as TrendCharts,
 *     each service's response time and uptime as BarCharts
 */

import { useState } from "react";
import {
  Badge, BarChart, Columns, KeyValue, LayoutSwitch, List, PageHeader, Section, STATUS_DOT, StatGrid, StatTile, Tabs, TONES, TrendChart, useListLayout, type Tone,
} from "@/components/ui/kit";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useUrlState } from "@/lib/useUrlState";

type Service = { id: string; name: string; what: string; port: number; via: "tunnel" | "direct"; status: "up" | "slow" | "down"; ms?: number; seen: (0 | 1)[]; uptime: number };
const STATUS: Record<Service["status"], { tone: Tone; label: string }> = {
  up: { tone: "accent", label: "Up" },
  slow: { tone: "yellow", label: "Slow" },
  down: { tone: "red", label: "Down" },
};

const SERVICES: Service[] = [
  { id: "files", name: "Files", what: "Shared folders", port: 8080, via: "direct", status: "up", ms: 18, seen: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], uptime: 100 },
  { id: "photos", name: "Photos", what: "Albums and uploads", port: 2283, via: "direct", status: "up", ms: 41, seen: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], uptime: 99.9 },
  { id: "downloads", name: "Downloads", what: "Queue and transfers", port: 8090, via: "tunnel", status: "slow", ms: 940, seen: [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1], uptime: 98.6 },
  { id: "music", name: "Music", what: "Library and streaming", port: 4533, via: "direct", status: "up", ms: 27, seen: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], uptime: 99.8 },
  { id: "notes", name: "Notes", what: "Shared notebooks", port: 3010, via: "direct", status: "down", seen: [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0], uptime: 93.1 },
];
const RANGES = [{ value: "day", label: "Day" }, { value: "week", label: "Week" }, { value: "month", label: "Month" }] as const;
const HISTORY: Record<(typeof RANGES)[number]["value"], { labels: string[]; uptime: number[]; ms: number[] }> = {
  day: { labels: ["00", "04", "08", "12", "16", "20"], uptime: [100, 100, 98, 96, 94, 92], ms: [31, 29, 44, 62, 58, 40] },
  week: { labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], uptime: [100, 99, 100, 98, 99, 100, 96], ms: [34, 31, 38, 52, 41, 30, 48] },
  month: { labels: ["Oct 1", "Oct 8", "Oct 15", "Oct 22", "Oct 29"], uptime: [99, 100, 98, 99, 97], ms: [36, 33, 41, 39, 45] },
};

export function StatusPage() {
  const [layout, setLayout] = useListLayout("status-services");
  const [range, setRange] = useUrlState<(typeof RANGES)[number]["value"]>("range", "week", RANGES.map((r) => r.value));
  const up = SERVICES.filter((s) => s.status !== "down");
  const answered = up.filter((s) => s.ms != null);
  const avg = Math.round(answered.reduce((n, s) => n + s.ms!, 0) / answered.length);
  const h = HISTORY[range];
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Status" title="All services" />

      <Section title="Connection" action={<Badge tone="accent" dot>Protected</Badge>} flush>
        <div className="divide-etched">
          <KeyValue label="Out through"><span className="font-mono">203.0.113.24</span></KeyValue>
          <KeyValue label="Location">Amsterdam</KeyValue>
          <KeyValue label="Direct address"><span className="font-mono">198.51.100.7</span></KeyValue>
          <KeyValue label="Last checked">10:42:05</KeyValue>
        </div>
      </Section>

      <StatGrid>
        <StatTile label="Up" value={`${up.length}/${SERVICES.length}`} accent={up.length < SERVICES.length ? "highlight" : "accent"} trend={[5, 5, 5, 5, 4, 5, 4]} />
        <StatTile label="Avg response" value={`${avg}ms`} accent="support" trend={h.ms} />
        <StatTile label="Uptime" value={`${h.uptime.at(-1)}%`} sub={`Over the last ${range}`} trend={h.uptime} />
        <StatTile label="Checks" value="2,016" sub="One a minute" />
      </StatGrid>

      <Section title="Services" count={SERVICES.length} action={<LayoutSwitch value={layout} onChange={setLayout} />} plain>
        <List layout={layout}>
          {SERVICES.map((s) => <ServiceRow key={s.id} service={s} />)}
        </List>
      </Section>

      <Section title="History" action={<Tabs size="sm" value={range} onChange={setRange} options={[...RANGES]} />} plain>
        <Columns>
          <Section title="Uptime">
            <TrendChart labels={h.labels} title={`Share of checks answered, over the last ${range}`} format={(n) => `${n}%`}
              series={[{ label: "Uptime", values: h.uptime }]} />
          </Section>
          <Section title="Average response">
            <TrendChart labels={h.labels} title={`Average response time, over the last ${range}`} format={(n) => `${n}ms`}
              series={[{ label: "Response", values: h.ms }]} />
          </Section>
          <Section title="Response by service">
            <BarChart title="Each service's average response time" format={(n) => `${n}ms`} tone="support"
              items={answered.map((s) => ({ id: s.id, label: s.name, value: s.ms! }))} />
          </Section>
          <Section title="Uptime by service">
            <BarChart title="Each service's uptime" format={(n) => `${n}%`}
              items={SERVICES.map((s) => ({ id: s.id, label: s.name, value: s.uptime }))} />
          </Section>
        </Columns>
      </Section>
    </div>
  );
}

function ServiceRow({ service: s }: { service: Service }) {
  const status = STATUS[s.status];
  const down = s.status === "down";
  return (
    <div className="flex h-full items-start gap-3 px-4 py-3.5">
      <span title={status.label} aria-label={status.label} className={cn(STATUS_DOT, "mt-1.5", TONES[status.tone].dot)} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-15 font-semibold">{s.name}</span>
        <span className="block text-sm text-text-muted">{s.what} · :{s.port}</span>
        <span className="mt-0.5 block truncate text-sm">
          <span className={cn("font-semibold", s.via === "tunnel" ? "text-accent" : "text-text-subtle")}>{s.via === "tunnel" ? "Through the tunnel" : "Direct"}</span>
        </span>
        <span className={cn("mt-0.5 block text-sm", down ? "text-highlight" : s.status === "slow" ? "text-text-muted" : "text-text-subtle")}>
          {down ? "Can't reach it." : `Answered in ${s.ms}ms`}
        </span>
        <span className="mt-2 flex items-center gap-2">
          <RecentChecks seen={s.seen} />
          <span className="text-xs text-text-subtle">{s.uptime}%</span>
        </span>
      </span>
      <Button size="sm" variant="secondary" disabled={down}>Open</Button>
    </div>
  );
}

/** The last checks, oldest first, as 8 px flat dots: accent answered, red didn't. */
function RecentChecks({ seen }: { seen: (0 | 1)[] }) {
  return (
    <span className="flex gap-1" role="img" aria-label={`${seen.filter(Boolean).length} of the last ${seen.length} checks answered`}>
      {seen.map((v, i) => <span key={i} className={cn("h-2 w-2 rounded-full", v ? TONES.accent.dot : TONES.red.dot)} />)}
    </span>
  );
}

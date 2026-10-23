/**
 * Showcase pages: a home dashboard, a list page and a detail page built only
 * from the kit, with neutral example content.
 */

import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Badge, EmptyState, EventRow, Hero, LinkCard, List, ListGroupLabel, PageHeader, Pager, PillTabs, RankedList,
  SearchField, Section, Sheet, StatGrid, StatTile, type RowStatus,
} from "@/components/ui/kit";
import { Button } from "@/components/ui/button";
import { ALL_TEMPLATES } from "@/lib/themes";

// Example statuses, mapped onto the kit's tones.
const DONE: RowStatus = { tone: "accent", label: "Done" };
const GOING: RowStatus = { tone: "yellow", label: "Going" };
const MAYBE: RowStatus = { tone: "purple", label: "Maybe" };
const MISSED: RowStatus = { tone: "red", label: "Missed" };
const CANCELLED: RowStatus = { tone: "muted", label: "Cancelled" };

type Item = { id: string; date: string; title: string; place: string; status: RowStatus };

const ITEMS: Item[] = [
  { id: "1", date: "2026-11-14", title: "Winter planning day", place: "Main hall", status: GOING },
  { id: "2", date: "2026-10-19", title: "Design review", place: "Studio B", status: DONE },
  { id: "3", date: "2026-10-02", title: "Community meetup", place: "Rooftop", status: MISSED },
  { id: "4", date: "2026-09-21", title: "Product launch party with a long title that wraps", place: "Main hall", status: DONE },
  { id: "5", date: "2026-09-06", title: "Weekend workshop — day 2", place: "Workshop room", status: MAYBE },
  { id: "6", date: "2026-08-15", title: "Summer picnic", place: "Riverside park", status: CANCELLED },
  { id: "7", date: "2026-08-02", title: "Team retro", place: "Studio B", status: DONE },
];

const monthOf = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

export function HomeDemo() {
  const templates = ALL_TEMPLATES.length;
  const next = ITEMS[0]!;
  return (
    <div className="space-y-8">
      <PageHeader eyebrow={`jimbo.ui ${__JIMBO_VERSION__} · showcase`} title="Overview" />
      <p className="meta -mt-5 max-w-xl">
        Everything here is rendered from this release's own code, the same files an app gets. The
        content is example data. Change the look on the Theme tab and every page follows.
      </p>

      <StatGrid>
        <StatTile label="Events done" value={128} accent="accent" />
        <StatTile label="People" value={342} accent="support" />
        <StatTile label="Places" value={27} />
        <StatTile label="Templates" value={templates} accent="highlight" sub="Everyday, holidays, places and teams" />
      </StatGrid>

      <LinkCard to="/admin/brand" eyebrow="Theme" title="Try a different look" sub="Templates, a colour picker and the save bar" accent />

      <div className="grid gap-3 sm:grid-cols-2">
        <LinkCard to="/events" eyebrow="List page" title="Search, filters, select mode" sub="Grouped rows, a floating action bar" />
        <LinkCard to="/admin/style" eyebrow="Kit" title="Every component" sub="Buttons, fields, cards, sheets, states" />
      </div>

      <Section title="Coming up" count={1} flush>
        <EventRow to={`/events/${next.id}`} date={next.date} title={next.title} subtitle={next.place} status={next.status} />
      </Section>

      <Section title="Most visited" flush>
        <RankedList unit="visit" items={[
          { id: "a", name: "Main hall", sub: "2021–2026", count: 12, href: "/events/4" },
          { id: "b", name: "Studio B", sub: "2023–2026", count: 7, href: "/events/2" },
          { id: "c", name: "Rooftop", count: 3, href: "/events/3" },
        ]} />
      </Section>
    </div>
  );
}

export function ListDemo() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "done" | "upcoming">("all");
  const [selecting, setSelecting] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  const rows = useMemo(() => ITEMS.filter((s) =>
    (filter === "all" || (filter === "done" ? s.status === DONE : s.status === GOING || s.status === MAYBE))
    && `${s.title} ${s.place}`.toLowerCase().includes(q.trim().toLowerCase())), [q, filter]);

  const groups = rows.reduce<{ month: string; items: Item[] }[]>((acc, s) => {
    const m = monthOf(s.date);
    const last = acc[acc.length - 1];
    if (last?.month === m) last.items.push(s); else acc.push({ month: m, items: [s] });
    return acc;
  }, []);

  const toggle = (id: string) => setPicked((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Example" title="Events" count={rows.length}
        actions={<Button size="sm" variant="secondary" onClick={() => { setSelecting((s) => !s); setPicked(new Set()); }}>{selecting ? "Done" : "Select"}</Button>} />
      <SearchField value={q} onChange={setQ} placeholder="Search events and places" />
      <PillTabs value={filter} onChange={setFilter} options={[
        { value: "all", label: "All" }, { value: "done", label: "Done" }, { value: "upcoming", label: "Upcoming" },
      ]} />

      {groups.length === 0 ? (
        <EmptyState title="No events match" body="Try fewer words, or a different filter."
          action={<Button size="sm" onClick={() => { setQ(""); setFilter("all"); }}>Clear search</Button>} />
      ) : (
        <List>
          {groups.map((g) => (
            <div key={g.month}>
              <ListGroupLabel>{g.month}</ListGroupLabel>
              {g.items.map((s) => (
                <EventRow key={s.id} to={`/events/${s.id}`} date={s.date} title={s.title} subtitle={s.place} status={s.status}
                  selected={selecting ? picked.has(s.id) : undefined} onSelect={selecting ? () => toggle(s.id) : undefined} />
              ))}
            </div>
          ))}
        </List>
      )}
      <Pager page={page} totalPages={3} total={56} pageSize={24} onPage={setPage} />

      {selecting && picked.size > 0 && (
        <div className="fixed inset-x-0 z-40 flex justify-center px-3 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] sm:bottom-6">
          <div className="flex w-full max-w-md items-center gap-2 rounded-2xl border border-border bg-surface/95 p-2 pl-4 shadow-2xl shadow-black/50 backdrop-blur-xl">
            <p className="min-w-0 flex-1 truncate text-sm font-semibold">{picked.size} selected</p>
            <Button size="sm" variant="ghost" onClick={() => setPicked(new Set())}>Clear</Button>
            <Button size="sm" onClick={() => { setSelecting(false); setPicked(new Set()); }}>Group…</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function DetailDemo() {
  const { id } = useParams();
  const item = ITEMS.find((s) => s.id === id) ?? ITEMS[0]!;
  const [sheet, setSheet] = useState(false);
  return (
    <div className="space-y-6">
      <Hero eyebrow={`${monthOf(item.date)} · ${item.place}`} title={item.title} back={{ to: "/events", label: "Events" }}
        badge={<Badge tone={item.status.tone}>{item.status.label}</Badge>}
        actions={<>
          <Button size="sm" onClick={() => setSheet(true)}>Edit…</Button>
          <Button size="sm" variant="secondary">Share</Button>
        </>}>
        <p className="meta">A detail page opens with a hero: back, status, title, actions.</p>
      </Hero>
      <Section title="Agenda" count={3}>
        <ol className="divide-etched">
          {["Welcome", "The main session", "Wrap-up"].map((part, i) => (
            <li key={part} className="flex items-center gap-3 px-4 py-3 text-[15px]">
              <span className="w-5 text-right font-display text-text-subtle">{i + 1}</span>{part}
            </li>
          ))}
        </ol>
      </Section>
      <EmptyState title="No photos yet" body="Add photos and they'll appear here." action={<Button size="sm" variant="secondary">Add photos</Button>} />
      {sheet && (
        <Sheet title="Edit event" subtitle={item.title} onClose={() => setSheet(false)}>
          <div className="space-y-3 p-5">
            <label className="label" htmlFor="edit-place">Place</label>
            <input id="edit-place" className="field h-12 w-full sm:h-11" defaultValue={item.place} />
            <Button className="w-full" onClick={() => setSheet(false)}>Save</Button>
          </div>
        </Sheet>
      )}
    </div>
  );
}

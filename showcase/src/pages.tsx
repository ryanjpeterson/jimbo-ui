/**
 * Showcase pages: a home dashboard, a list page and a detail page built only
 * from the kit, with example content from the reference app (concerts).
 */

import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  EmptyState, EventRow, Hero, LinkCard, List, ListGroupLabel, PageHeader, Pager, PillTabs, RankedList,
  SearchField, Section, Sheet, StatGrid, StatTile, StatusBadge,
} from "@/components/ui/kit";
import { Button } from "@/components/ui/button";
import { TEMPLATE_GROUPS } from "@/lib/themes";
import type { AttendanceStatus } from "@tagg/shared";

type Show = { id: string; date: string; title: string; venue: string; status: AttendanceStatus };

const SHOWS: Show[] = [
  { id: "1", date: "2026-11-14", title: "Turnstile / Mannequin Pussy", venue: "TD Place", status: "attending" },
  { id: "2", date: "2026-10-19", title: "AFI / Choir Boy", venue: "Bronson Centre", status: "attended" },
  { id: "3", date: "2026-10-02", title: "Spiritbox", venue: "Algonquin Commons", status: "missed" },
  { id: "4", date: "2026-09-21", title: "Carnifex / Cryptopsy / Organectomy", venue: "The Brass Monkey", status: "attended" },
  { id: "5", date: "2026-09-06", title: "Japanese Breakfast", venue: "Bluesfest — Day 3", status: "interested" },
  { id: "6", date: "2026-08-15", title: "Rush tribute night", venue: "Lansdowne", status: "cancelled" },
  { id: "7", date: "2026-08-02", title: "Foo Fighters / Against Me!", venue: "Canadian Tire Centre", status: "attended" },
];

const monthOf = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

export function HomeDemo() {
  const templates = TEMPLATE_GROUPS.reduce((n, g) => n + g.templates.length, 0);
  return (
    <div className="space-y-8">
      <PageHeader eyebrow={`jimbo-ui ${__JIMBO_VERSION__} · showcase`} title="The damage" />
      <p className="meta -mt-5 max-w-xl">
        Everything here is rendered from this release's own code, the same files an app gets. The
        content is example data. Change the look on the Theme tab and every page follows.
      </p>

      <StatGrid>
        <StatTile label="Shows attended" value={177} accent="lime" />
        <StatTile label="Artists seen" value={424} />
        <StatTile label="Venues" value={51} />
        <StatTile label="Templates" value={templates} accent="pink" sub="Dark, mid and light" />
      </StatGrid>

      <LinkCard to="/admin/brand" eyebrow="Theme" title="Try a different look" sub="Templates, a colour picker and the save bar" accent />

      <div className="grid gap-3 sm:grid-cols-2">
        <LinkCard to="/shows" eyebrow="List page" title="Search, filters, select mode" sub="Grouped rows, a floating action bar" />
        <LinkCard to="/admin/style" eyebrow="Kit" title="Every component" sub="Buttons, fields, cards, sheets, states" />
      </div>

      <Section title="Coming up" count={1}>
        <List className="border-0 shadow-none">
          <EventRow to="/shows/1" date={SHOWS[0]!.date} title={SHOWS[0]!.title} subtitle={SHOWS[0]!.venue} status={SHOWS[0]!.status} />
        </List>
      </Section>

      <Section title="Seen most" flush>
        <RankedList items={[
          { id: "a", name: "Foo Fighters", sub: "2008–2026", count: 5, href: "/shows/7" },
          { id: "b", name: "AFI", sub: "2011–2026", count: 4, href: "/shows/2" },
          { id: "c", name: "Cryptopsy", count: 3, href: "/shows/4" },
        ]} />
      </Section>
    </div>
  );
}

export function ListDemo() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "attended" | "upcoming">("all");
  const [selecting, setSelecting] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  const rows = useMemo(() => SHOWS.filter((s) =>
    (filter === "all" || (filter === "attended" ? s.status === "attended" : s.status === "attending" || s.status === "interested"))
    && `${s.title} ${s.venue}`.toLowerCase().includes(q.trim().toLowerCase())), [q, filter]);

  const groups = rows.reduce<{ month: string; shows: Show[] }[]>((acc, s) => {
    const m = monthOf(s.date);
    const last = acc[acc.length - 1];
    if (last?.month === m) last.shows.push(s); else acc.push({ month: m, shows: [s] });
    return acc;
  }, []);

  const toggle = (id: string) => setPicked((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Example" title="Shows" count={rows.length}
        actions={<Button size="sm" variant="secondary" onClick={() => { setSelecting((s) => !s); setPicked(new Set()); }}>{selecting ? "Done" : "Select"}</Button>} />
      <SearchField value={q} onChange={setQ} placeholder="Search shows and venues" />
      <PillTabs value={filter} onChange={setFilter} options={[
        { value: "all", label: "All" }, { value: "attended", label: "Attended" }, { value: "upcoming", label: "Upcoming" },
      ]} />

      {groups.length === 0 ? (
        <EmptyState title="No shows match" body="Try fewer words, or a different filter." action={<Button size="sm" onClick={() => { setQ(""); setFilter("all"); }}>Clear search</Button>} />
      ) : (
        <List>
          {groups.map((g) => (
            <div key={g.month}>
              <ListGroupLabel>{g.month}</ListGroupLabel>
              {g.shows.map((s) => (
                <EventRow key={s.id} to={`/shows/${s.id}`} date={s.date} title={s.title} subtitle={s.venue} status={s.status}
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
            <Button size="sm" onClick={() => { setSelecting(false); setPicked(new Set()); }}>Add to festival…</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function DetailDemo() {
  const { id } = useParams();
  const show = SHOWS.find((s) => s.id === id) ?? SHOWS[0]!;
  const [sheet, setSheet] = useState(false);
  return (
    <div className="space-y-6">
      <Hero eyebrow={`${monthOf(show.date)} · ${show.venue}`} title={show.title} back={{ to: "/shows", label: "Shows" }}
        badge={<StatusBadge status={show.status} />}
        actions={<>
          <Button size="sm" onClick={() => setSheet(true)}>Edit…</Button>
          <Button size="sm" variant="secondary">Share</Button>
        </>}>
        <p className="meta">A detail page opens with a hero: back, status, title, actions.</p>
      </Hero>
      <Section title="Setlist" count={3}>
        <ol className="divide-y divide-border">
          {["Opener", "The big single", "Encore"].map((song, i) => (
            <li key={song} className="flex items-center gap-3 px-4 py-3 text-[15px]">
              <span className="w-5 text-right font-display text-text-subtle">{i + 1}</span>{song}
            </li>
          ))}
        </ol>
      </Section>
      <EmptyState title="No photos yet" body="Add photos from the show and they'll appear here." action={<Button size="sm" variant="secondary">Add photos</Button>} />
      {sheet && (
        <Sheet title="Edit show" subtitle={show.title} onClose={() => setSheet(false)}>
          <div className="space-y-3 p-5">
            <label className="label" htmlFor="edit-venue">Venue</label>
            <input id="edit-venue" className="field h-12 w-full sm:h-11" defaultValue={show.venue} />
            <Button className="w-full" onClick={() => setSheet(false)}>Save</Button>
          </div>
        </Sheet>
      )}
    </div>
  );
}

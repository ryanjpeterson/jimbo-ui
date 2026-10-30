/**
 * Archetype: Catalogue — a log of dated entries, the people and places in
 * them, and numbers about it all. Remix it: rename the nouns, swap the
 * statuses for the app's own, drop a tab you don't need.
 *
 * Shape (dock tabs): Home · Entries · People · Places — plus the jimbo-ui
 * config section under the app's settings.
 *   Home      HeroSection, StatGrid, "Coming up" EventRow, RankedList
 *   Entries   SearchField, PillTabs, List grouped by month of EventRow, select mode, Pager
 *   Entry     Hero, Sections, a compact MapView, edit in a Sheet
 *   People    SearchField, List of EntityRow
 *   Places    List ⇄ Map (ViewSwitch); the map page is MapView fill + MapPinCard
 *
 * Routes take a `base` so the showcase can mount it under a path; an app
 * mounts it at "" and puts CATALOGUE_TABS in its AppShell.
 */

import { useMemo, useState, type ReactNode } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import {
  Badge, EmptyState, EntityRow, EventRow, Hero, HeroSection, List, ListGroupLabel, PageHeader, Pager, PillTabs, RankedList,
  SearchField, Section, Sheet, StatGrid, StatTile, ViewSwitch, type RowStatus,
} from "@/components/ui/kit";
import { Button } from "@/components/ui/button";
import { MapPinCard, MapView, type MapPin } from "@/components/MapView";

// Example statuses, mapped onto the kit's tones. An app maps its own.
const DONE: RowStatus = { tone: "accent", label: "Done" };
const GOING: RowStatus = { tone: "yellow", label: "Going" };
const MAYBE: RowStatus = { tone: "purple", label: "Maybe" };
const MISSED: RowStatus = { tone: "red", label: "Missed" };
const CANCELLED: RowStatus = { tone: "muted", label: "Cancelled" };

type Place = MapPin & { area: string };
type Entry = { id: string; date: string; title: string; place: string; people: string[]; status: RowStatus };

const PLACES: Place[] = [
  { id: "hall", label: "Main hall", area: "Downtown", lat: 43.6487, lng: -79.3817 },
  { id: "studio", label: "Studio B", area: "West end", lat: 43.6455, lng: -79.4182 },
  { id: "roof", label: "Rooftop", area: "Harbourfront", lat: 43.6389, lng: -79.3801 },
  { id: "park", label: "Riverside park", area: "East side", lat: 43.6624, lng: -79.3536 },
  { id: "workshop", label: "Workshop room", area: "Midtown", lat: 43.6702, lng: -79.3925 },
];

const ENTRIES: Entry[] = [
  { id: "1", date: "2026-11-14", title: "Winter planning day", place: "hall", people: ["Ana Ruiz", "Sam Lee"], status: GOING },
  { id: "2", date: "2026-10-19", title: "Design review", place: "studio", people: ["Sam Lee"], status: DONE },
  { id: "3", date: "2026-10-02", title: "Community meetup", place: "roof", people: ["Jo Park", "Ana Ruiz"], status: MISSED },
  { id: "4", date: "2026-09-21", title: "Product launch party with a long title that wraps", place: "hall", people: ["Ana Ruiz", "Jo Park", "Kit Moss"], status: DONE },
  { id: "5", date: "2026-09-06", title: "Weekend workshop — day 2", place: "workshop", people: ["Kit Moss"], status: MAYBE },
  { id: "6", date: "2026-08-15", title: "Summer picnic", place: "park", people: ["Sam Lee", "Jo Park"], status: CANCELLED },
  { id: "7", date: "2026-08-02", title: "Team retro", place: "studio", people: ["Ana Ruiz"], status: DONE },
];

const placeOf = (id: string) => PLACES.find((p) => p.id === id)!;
const monthOf = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
const PEOPLE = [...new Set(ENTRIES.flatMap((e) => e.people))].sort();
const countBy = <T,>(xs: T[], key: (x: T) => string) => xs.reduce<Record<string, number>>((m, x) => ({ ...m, [key(x)]: (m[key(x)] ?? 0) + 1 }), {});

/** The dock tabs for an app built from this archetype (icons are the app's). */
export const CATALOGUE_TABS = [
  { to: "/", label: "Home" }, { to: "/entries", label: "Entries" }, { to: "/people", label: "People" }, { to: "/places", label: "Places" },
] as const;

export function CatalogueRoutes({ base = "", nav }: { base?: string; nav?: (current: string) => ReactNode }) {
  const at = (p: string) => `${base}${p}`;
  const page = (current: string, el: ReactNode) => <>{nav?.(current)}{el}</>;
  return (
    <Routes>
      <Route index element={page("/", <CatalogueHome at={at} />)} />
      <Route path="entries" element={page("/entries", <Entries at={at} />)} />
      <Route path="entries/:id" element={page("/entries", <EntryPage at={at} />)} />
      <Route path="people" element={page("/people", <People at={at} />)} />
      <Route path="places" element={page("/places", <Places at={at} />)} />
      <Route path="map" element={page("/places", <PlacesMap at={at} />)} />
    </Routes>
  );
}

type At = { at: (p: string) => string };

function CatalogueHome({ at }: At) {
  const next = ENTRIES.find((e) => e.status === GOING)!;
  const byPlace = countBy(ENTRIES, (e) => e.place);
  return (
    <div className="space-y-8">
      <HeroSection eyebrow="Catalogue" title="Your year so far" pattern="ripples">
        A log of things you've done, who was there and where — with the numbers.
      </HeroSection>
      <StatGrid>
        <StatTile label="Entries" value={ENTRIES.length} accent="accent" />
        <StatTile label="People" value={PEOPLE.length} accent="support" />
        <StatTile label="Places" value={PLACES.length} />
        <StatTile label="Done" value={ENTRIES.filter((e) => e.status === DONE).length} accent="highlight" />
      </StatGrid>
      <Section title="Coming up" count={1} flush>
        <EventRow to={at(`/entries/${next.id}`)} date={next.date} title={next.title} subtitle={placeOf(next.place).label} status={next.status} />
      </Section>
      <Section title="Most visited" flush>
        <RankedList unit="visit" items={Object.entries(byPlace).sort((a, b) => b[1] - a[1]).slice(0, 3)
          .map(([id, count]) => ({ id, name: placeOf(id).label, sub: placeOf(id).area, count, href: at("/places") }))} />
      </Section>
    </div>
  );
}

function Entries({ at }: At) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "done" | "upcoming">("all");
  const [selecting, setSelecting] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  const rows = useMemo(() => ENTRIES.filter((s) =>
    (filter === "all" || (filter === "done" ? s.status === DONE : s.status === GOING || s.status === MAYBE))
    && `${s.title} ${placeOf(s.place).label}`.toLowerCase().includes(q.trim().toLowerCase())), [q, filter]);
  const groups = rows.reduce<{ month: string; items: Entry[] }[]>((acc, s) => {
    const m = monthOf(s.date);
    const last = acc[acc.length - 1];
    if (last?.month === m) last.items.push(s); else acc.push({ month: m, items: [s] });
    return acc;
  }, []);
  const toggle = (id: string) => setPicked((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Catalogue" title="Entries" count={rows.length}
        actions={<Button size="sm" variant="secondary" onClick={() => { setSelecting((s) => !s); setPicked(new Set()); }}>{selecting ? "Done" : "Select"}</Button>} />
      <SearchField value={q} onChange={setQ} placeholder="Search entries and places" />
      <PillTabs value={filter} onChange={setFilter} options={[
        { value: "all", label: "All" }, { value: "done", label: "Done" }, { value: "upcoming", label: "Upcoming" },
      ]} />
      {groups.length === 0 ? (
        <EmptyState title="No entries match" body="Try fewer words, or a different filter."
          action={<Button size="sm" onClick={() => { setQ(""); setFilter("all"); }}>Clear search</Button>} />
      ) : (
        <List>
          {groups.map((g) => (
            <div key={g.month}>
              <ListGroupLabel>{g.month}</ListGroupLabel>
              {g.items.map((s) => (
                <EventRow key={s.id} to={at(`/entries/${s.id}`)} date={s.date} title={s.title} subtitle={placeOf(s.place).label} status={s.status}
                  selected={selecting ? picked.has(s.id) : undefined} onSelect={selecting ? () => toggle(s.id) : undefined} />
              ))}
            </div>
          ))}
        </List>
      )}
      <Pager page={page} totalPages={3} total={56} pageSize={24} onPage={setPage} />
      {selecting && picked.size > 0 && (
        <div className="fixed inset-x-0 z-40 flex justify-center px-3 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] sm:bottom-6">
          <div className="flex w-full max-w-md items-center gap-2 rounded-2xl border border-border bg-surface/95 p-2 pl-4 shadow-2xl backdrop-blur-xl">
            <p className="min-w-0 flex-1 truncate text-sm font-semibold">{picked.size} selected</p>
            <Button size="sm" variant="ghost" onClick={() => setPicked(new Set())}>Clear</Button>
            <Button size="sm" onClick={() => { setSelecting(false); setPicked(new Set()); }}>Group…</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function EntryPage({ at }: At) {
  const { id } = useParams();
  const item = ENTRIES.find((s) => s.id === id) ?? ENTRIES[0]!;
  const place = placeOf(item.place);
  const [sheet, setSheet] = useState(false);
  return (
    <div className="space-y-6">
      <Hero eyebrow={`${monthOf(item.date)} · ${place.label}`} title={item.title} back={{ to: at("/entries"), label: "Entries" }}
        badge={<Badge tone={item.status.tone}>{item.status.label}</Badge>}
        actions={<><Button size="sm" onClick={() => setSheet(true)}>Edit…</Button><Button size="sm" variant="secondary">Share</Button></>}>
        <p className="meta">A detail page opens with a hero: back, status, title, actions.</p>
      </Hero>
      <Section title="Who was there" count={item.people.length} flush>
        {item.people.map((p) => <EntityRow key={p} to={at("/people")} name={p} round />)}
      </Section>
      <Section title="Where" flush>
        <div className="p-3"><MapView size="compact" pins={[place]} selected={place.id} /></div>
        <EntityRow to={at("/places")} name={place.label} sub={place.area} />
      </Section>
      {sheet && (
        <Sheet title="Edit entry" subtitle={item.title} onClose={() => setSheet(false)}>
          <div className="space-y-3 p-5">
            <label className="label" htmlFor="edit-title">Title</label>
            <input id="edit-title" className="field h-12 w-full sm:h-11" defaultValue={item.title} />
            <Button className="w-full" onClick={() => setSheet(false)}>Save</Button>
          </div>
        </Sheet>
      )}
    </div>
  );
}

function People({ at }: At) {
  const [q, setQ] = useState("");
  const counts = countBy(ENTRIES.flatMap((e) => e.people), (p) => p);
  const shown = PEOPLE.filter((p) => p.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Catalogue" title="People" count={shown.length} />
      <SearchField value={q} onChange={setQ} placeholder="Search people" />
      <List>{shown.map((p) => <EntityRow key={p} to={at("/entries")} name={p} sub={`${counts[p]} ${counts[p] === 1 ? "entry" : "entries"}`} round />)}</List>
    </div>
  );
}

function PlaceSwitch({ at, view }: At & { view: "list" | "map" }) {
  return <ViewSwitch current={at(view === "list" ? "/places" : "/map")} floating={view === "map"}
    options={[{ to: at("/places"), label: "List" }, { to: at("/map"), label: "Map" }]} />;
}

function Places({ at }: At) {
  const counts = countBy(ENTRIES, (e) => e.place);
  return (
    <div className="space-y-5">
      <PageHeader eyebrow="Catalogue" title="Places" count={PLACES.length} actions={<PlaceSwitch at={at} view="list" />} />
      <List>{PLACES.map((p) => <EntityRow key={p.id} to={at("/map")} name={p.label} sub={p.area} meta={`${counts[p.id] ?? 0}`} />)}</List>
    </div>
  );
}

/** The map page: the map fills the page, the switch floats, the chosen place in a card above the dock. */
function PlacesMap({ at }: At) {
  const [selected, setSelected] = useState<Place | null>(null);
  const here = selected ? ENTRIES.filter((e) => e.place === selected.id) : [];
  return (
    <div className="relative -mx-4 h-[calc(100dvh-10rem)] overflow-hidden sm:mx-0 sm:rounded-2xl">
      <MapView size="fill" pins={PLACES} selected={selected?.id} onSelect={(p) => setSelected(placeOf(p.id))} />
      <div className="absolute left-4 top-4 z-10"><PlaceSwitch at={at} view="map" /></div>
      {selected && (
        <MapPinCard title={selected.label} sub={`${selected.area} · ${here.length} ${here.length === 1 ? "entry" : "entries"}`} onClose={() => setSelected(null)}>
          <ul className="space-y-1 text-sm">{here.map((e) => <li key={e.id} className="truncate">{e.title}</li>)}</ul>
        </MapPinCard>
      )}
    </div>
  );
}

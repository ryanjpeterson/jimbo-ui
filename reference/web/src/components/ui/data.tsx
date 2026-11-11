/**
 * Data: many records with several facts each, and content to fold away.
 *
 * - `DataTable` — a sortable table on desktop that becomes a list of rows
 *   on phones (never a table that scrolls sideways).
 * - `Accordion` — sections that open one at a time (or several): FAQs,
 *   advanced settings, a long detail page's extras.
 *
 * Built on jimbo.ui's shadcn primitives: Table, Accordion, Card.
 *
 * jimbo-ui reference: copy into an app as is.
 */

import { useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpIcon } from "lucide-react";
import { Chevron } from "@/components/ui/kit";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion as AccordionRoot, AccordionContent, AccordionItem as AccordionPrimitiveItem, AccordionTrigger } from "@/components/ui/accordion";

export type SortDir = "asc" | "desc";
export type TableSort = { key: string; dir: SortDir };

export type Column<T> = {
  key: string;
  label: string;
  /** What the cell shows. */
  cell: (row: T) => ReactNode;
  /** The value to sort by; without it the column doesn't sort. */
  sortValue?: (row: T) => string | number;
  /** Numbers and amounts: right-aligned, tabular figures. */
  numeric?: boolean;
  /** The row's name: bold, and the title of each row on phones. One per table. */
  primary?: boolean;
  /** Leave it out of the phone rows (keep three or four facts there at most). */
  hideOnPhone?: boolean;
};

/**
 * Many records with several facts each (runs, members, orders), sortable by
 * any column that has a `sortValue` — tap a heading; again to reverse. On
 * phones each record is a row: the `primary` column as its title and the
 * others as short "label value" pairs under it. `rowTo` makes every row go
 * somewhere. Keep `sort` in the URL (useUrlState) so it survives a refresh;
 * without `sort`/`onSort` it sorts on its own.
 */
export function DataTable<T>({ columns, rows, rowKey, rowTo, sort: given, onSort, caption, empty = "Nothing here yet." }: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  rowTo?: (row: T) => string;
  sort?: TableSort | null;
  onSort?: (sort: TableSort) => void;
  /** What the table holds, for screen readers. */
  caption: string;
  empty?: ReactNode;
}) {
  const [own, setOwn] = useState<TableSort | null>(null);
  const sort = given !== undefined ? given : own;
  const setSort = onSort ?? setOwn;
  const navigate = useNavigate();
  const sorted = useMemo(() => {
    const col = columns.find((c) => c.key === sort?.key);
    if (!sort || !col?.sortValue) return rows;
    const by = col.sortValue;
    const out = [...rows].sort((a, b) => {
      const x = by(a), y = by(b);
      return typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), undefined, { numeric: true });
    });
    return sort.dir === "desc" ? out.reverse() : out;
  }, [rows, columns, sort]);
  const primary = columns.find((c) => c.primary) ?? columns[0]!;
  const rest = columns.filter((c) => c !== primary && !c.hideOnPhone);
  const toggle = (c: Column<T>) => setSort({ key: c.key, dir: sort?.key === c.key && sort.dir === (c.numeric ? "desc" : "asc") ? (c.numeric ? "asc" : "desc") : (c.numeric ? "desc" : "asc") });

  if (rows.length === 0) return <Card className="p-6 text-center text-sm text-muted-foreground">{empty}</Card>;

  return (
    <>
      {/* Phones: a row per record. */}
      <Card className="divide-etched gap-0 overflow-hidden py-0 sm:hidden">
        {sorted.map((r) => {
          const body = (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-15 font-semibold text-foreground group-hover:text-primary">{primary.cell(r)}</p>
                {rest.length > 0 && (
                  <p className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-sm">
                    {rest.map((c) => (
                      <span key={c.key} className="min-w-0"><span className="text-subtle-foreground">{c.label}</span> <span className={cn("text-muted-foreground", c.numeric && "tabular-nums")}>{c.cell(r)}</span></span>
                    ))}
                  </p>
                )}
              </div>
              {rowTo && <Chevron className="text-subtle-foreground group-hover:text-primary" />}
            </>
          );
          const cls = "group flex min-h-[64px] items-center gap-3 px-4 py-3 transition-colors hover:bg-accent";
          return rowTo ? <Link key={rowKey(r)} to={rowTo(r)} className={cls}>{body}</Link> : <div key={rowKey(r)} className={cls}>{body}</div>;
        })}
      </Card>

      {/* Desktop: a table. */}
      <Card className="hidden gap-0 overflow-hidden py-0 sm:flex">
        <Table>
          <TableCaption className="sr-only">{caption}</TableCaption>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((c) => {
                const on = sort?.key === c.key;
                return (
                  <TableHead key={c.key} scope="col" aria-sort={on ? (sort!.dir === "asc" ? "ascending" : "descending") : undefined}
                    className={cn("h-11 px-4 text-xs font-semibold uppercase tracking-wider text-subtle-foreground", c.numeric && "text-right")}>
                    {c.sortValue ? (
                      <button type="button" onClick={() => toggle(c)}
                        className={cn("-mx-2 inline-flex h-9 items-center gap-1 rounded-lg px-2 uppercase tracking-wider transition-colors hover:bg-accent hover:text-foreground", on && "text-foreground", c.numeric && "flex-row-reverse")}>
                        {c.label}
                        <ArrowUpIcon aria-hidden="true" strokeWidth={3}
                          className={cn("size-3 transition-transform", on ? "text-primary" : "opacity-40", on && sort!.dir === "desc" && "rotate-180")} />
                      </button>
                    ) : c.label}
                  </TableHead>
                );
              })}
              {rowTo && <TableHead aria-hidden="true" className="w-10" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((r) => (
              <TableRow key={rowKey(r)} onClick={rowTo ? (e) => { if (!(e.target as HTMLElement).closest("a,button")) navigate(rowTo(r)); } : undefined}
                className={cn("group", rowTo ? "cursor-pointer hover:bg-accent" : "hover:bg-transparent")}>
                {columns.map((c) => (
                  <TableCell key={c.key} className={cn("h-14 px-4", c.numeric && "text-right tabular-nums", c === primary ? "text-15 font-semibold text-foreground" : "text-muted-foreground")}>
                    {c === primary && rowTo ? <Link to={rowTo(r)} className="group-hover:text-primary">{c.cell(r)}</Link> : c.cell(r)}
                  </TableCell>
                ))}
                {rowTo && <TableCell className="pr-3"><Chevron className="text-subtle-foreground group-hover:text-primary" /></TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </>
  );
}

export type AccordionItem = { id: string; title: ReactNode; sub?: ReactNode; content: ReactNode };

/**
 * Sections that fold (shadcn `Accordion`): each a row with a title (and a
 * line under it) that opens its content below. One open at a time unless
 * `multiple`. In one card, divided like a List. Not for the main content of
 * a page — only what most people won't need.
 */
export function Accordion({ items, multiple = false, defaultOpen, className }: {
  items: AccordionItem[];
  multiple?: boolean;
  /** The id open at first. */
  defaultOpen?: string;
  /** Layout only (J3). */
  className?: string;
}) {
  const inner = items.map((it) => (
    <AccordionPrimitiveItem key={it.id} value={it.id} className="border-b-0">
      <AccordionTrigger className="min-h-[60px] items-center gap-3 rounded-none px-4 py-3 hover:bg-accent hover:no-underline [&>svg]:size-5 [&>svg]:text-subtle-foreground">
        <span className="min-w-0 flex-1">
          <span className="block text-15 font-semibold">{it.title}</span>
          {it.sub && <span className="block text-sm font-normal text-muted-foreground">{it.sub}</span>}
        </span>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 text-15 text-muted-foreground">{it.content}</AccordionContent>
    </AccordionPrimitiveItem>
  ));
  return (
    <Card className={cn("gap-0 overflow-hidden py-0", className)}>
      {multiple
        ? <AccordionRoot type="multiple" defaultValue={defaultOpen ? [defaultOpen] : []} className="divide-etched">{inner}</AccordionRoot>
        : <AccordionRoot type="single" collapsible defaultValue={defaultOpen} className="divide-etched">{inner}</AccordionRoot>}
    </Card>
  );
}

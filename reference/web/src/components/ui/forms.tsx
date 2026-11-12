/**
 * Form fields: a label above, the field, then a hint or an error under it.
 * Errors are inline, in the highlight colour, and keep what was typed.
 *
 * - `TextField` — one line (text, email, number, password, URL…).
 * - `TextArea` — several lines; grows with its text, counts down to a limit.
 * - `DateField` — a date, time or both, with the platform's own picker
 *   (the phone wheel on iOS, the calendar on Android and desktop).
 * - `FileDrop` — pick or drop files; checks type and size and lists them.
 * - `ConditionGroup` — a rule's conditions as rows of chips: "All of",
 *   "Any of", "Except"; a chip's text edits it, its × removes it.
 *
 * SearchField, SelectField, Autocomplete, RangeField and ColorPicker are in
 * the kit. All of them are 48 px tall on phones, 44 from `sm:` up.
 *
 * Built on jimbo.ui's shadcn primitives: Field (label, description, error),
 * Input and Textarea; ConditionGroup on Badge and Button.
 *
 * jimbo-ui reference: copy into an app as is.
 */

import { useId, useLayoutEffect, useRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { CalendarIcon, CircleAlertIcon, ClockIcon, UploadIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/** The label, hint and error around a field, wired up with ids for screen readers. */
function FieldFrame({ id, label, hint, error, optional, counter, className, children }: {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  optional?: boolean;
  counter?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Field data-invalid={error ? true : undefined} className={cn("gap-1.5", className)}>
      <FieldLabel htmlFor={id} className="flex items-baseline justify-between gap-3 text-sm font-semibold text-muted-foreground">
        <span>{label}{optional && <span className="ml-1.5 font-normal text-subtle-foreground">optional</span>}</span>
        {counter}
      </FieldLabel>
      {children}
      {error
        ? <FieldError id={`${id}-msg`} className="flex items-start gap-1.5 font-semibold text-highlight">
            <CircleAlertIcon aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" strokeWidth={2.5} />
            {error}
          </FieldError>
        : hint && <FieldDescription id={`${id}-msg`} className="text-subtle-foreground">{hint}</FieldDescription>}
    </Field>
  );
}

const fieldCls = (error: ReactNode) => (error ? "border-highlight focus-visible:border-highlight focus-visible:ring-highlight/25" : "");

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "size" | "prefix">;

/**
 * One line of text with its label, an optional hint, and an error once
 * there is one (`error` — say what to do: "Add an @ and a domain"). `prefix`
 * and `suffix` sit inside the field ("$", "kg", a show-password button).
 */
export function TextField({ label, value, onChange, hint, error, optional, prefix, suffix, className, id: given, ...rest }: InputProps & {
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  hint?: ReactNode;
  error?: ReactNode;
  /** Marks it "optional" beside the label (required ones aren't marked). */
  optional?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
}) {
  const auto = useId();
  const id = given ?? auto;
  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
      <div className="relative">
        {prefix && <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-15 text-subtle-foreground">{prefix}</span>}
        <Input id={id} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${id}-msg` : undefined} {...rest}
          className={cn(fieldCls(error), prefix && "pl-9", suffix && "pr-12")} />
        {suffix && <span className="absolute inset-y-0 right-1 flex items-center">{suffix}</span>}
      </div>
    </FieldFrame>
  );
}

/**
 * Several lines of text. Grows with what's typed (from `rows` up to
 * `maxRows`), and with `maxLength` counts what's left beside the label once
 * it's close.
 */
export function TextArea({ label, value, onChange, hint, error, optional, rows = 3, maxRows = 10, maxLength, placeholder, className }: {
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  hint?: ReactNode;
  error?: ReactNode;
  optional?: boolean;
  rows?: number;
  maxRows?: number;
  maxLength?: number;
  placeholder?: string;
  className?: string;
}) {
  const id = useId();
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const cs = getComputedStyle(el);
    const line = parseFloat(cs.lineHeight) || 24;
    const frame = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom) + parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
    el.style.height = "auto";
    const want = el.scrollHeight + parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
    const most = maxRows * line + frame;
    el.style.height = `${Math.min(Math.max(want, rows * line + frame), most)}px`;
    el.style.overflowY = want > most ? "auto" : "hidden";
  }, [value, rows, maxRows]);
  const left = maxLength != null ? maxLength - value.length : null;
  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} optional={optional} className={className}
      counter={left != null && left <= Math.max(20, maxLength! * 0.1) && (
        <span className={cn("text-xs font-medium tabular-nums", left < 0 ? "text-highlight" : "text-subtle-foreground")} aria-live="polite">{left} left</span>
      )}>
      <Textarea ref={ref} id={id} value={value} onChange={(e) => onChange(e.target.value)} rows={rows} maxLength={maxLength} placeholder={placeholder}
        aria-invalid={error ? true : undefined} aria-describedby={error || hint ? `${id}-msg` : undefined}
        className={cn(fieldCls(error), "block resize-none py-3 leading-relaxed [field-sizing:fixed]")} />
    </FieldFrame>
  );
}

/**
 * A date, a time, or both, as `YYYY-MM-DD` / `HH:MM` / `YYYY-MM-DDTHH:MM`
 * strings, with the platform's own picker — the one people know on each
 * phone, and the page's light or dark scheme. `min` and `max` in the same
 * form. For a few fixed days, use ToggleGrid; for a range, two DateFields.
 */
export function DateField({ label, value, onChange, type = "date", min, max, hint, error, optional, className }: {
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  type?: "date" | "time" | "datetime-local";
  min?: string;
  max?: string;
  hint?: ReactNode;
  error?: ReactNode;
  optional?: boolean;
  className?: string;
}) {
  const id = useId();
  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} optional={optional} className={className}>
      <div className="relative">
        {(() => { const Icon = type === "time" ? ClockIcon : CalendarIcon; return <Icon aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-subtle-foreground" />; })()}
        {/* The picker button is the whole field: the platform's own icon is hidden (ours sits left). */}
        <Input id={id} type={type} value={value} min={min} max={max} onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined} aria-describedby={error || hint ? `${id}-msg` : undefined}
          className={cn(fieldCls(error), "appearance-none pl-10 tabular-nums",
            "[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-auto [&::-webkit-calendar-picker-indicator]:w-auto [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0",
            "[&::-webkit-date-and-time-value]:text-left", !value && "text-subtle-foreground")} />
      </div>
    </FieldFrame>
  );
}

/** 1536 → "1.5 KB". */
export function fileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let n = bytes, u = 0;
  while (n >= 1024 && u < units.length - 1) { n /= 1024; u++; }
  return `${u === 0 ? n : n.toFixed(n < 10 ? 1 : 0)} ${units[u]}`;
}

/** Whether a file fits an `accept` list ("image/*,.pdf"). */
function accepts(file: File, accept?: string): boolean {
  if (!accept) return true;
  return accept.split(",").map((a) => a.trim().toLowerCase()).some((a) =>
    a.startsWith(".") ? file.name.toLowerCase().endsWith(a) : a.endsWith("/*") ? file.type.startsWith(a.slice(0, -1)) : file.type === a);
}

/**
 * Pick files or drop them: a dashed drop area (the whole area is the
 * button — tap, Enter or drag onto it), then the files picked, each with its
 * size and a Remove. Files of the wrong type or over `maxSize` are turned
 * away with a line saying why. Controlled: `files` and `onChange`.
 */
export function FileDrop({ label, files, onChange, accept, multiple = false, maxSize, hint, className }: {
  label: ReactNode;
  files: File[];
  onChange: (files: File[]) => void;
  /** As the input's `accept`: "image/*", ".csv,.json". */
  accept?: string;
  multiple?: boolean;
  /** Largest file, in bytes. */
  maxSize?: number;
  /** What's allowed, in words ("PNG or JPEG, up to 5 MB"). */
  hint?: ReactNode;
  className?: string;
}) {
  const id = useId();
  const [over, setOver] = useState(false);
  const [refused, setRefused] = useState<string[]>([]);
  const add = (list: FileList | null) => {
    if (!list) return;
    const ok: File[] = [], no: string[] = [];
    for (const f of [...list]) {
      if (!accepts(f, accept)) no.push(`${f.name} isn't a type this takes`);
      else if (maxSize != null && f.size > maxSize) no.push(`${f.name} is over ${fileSize(maxSize)}`);
      else ok.push(f);
    }
    setRefused(no);
    if (ok.length) onChange(multiple ? [...files, ...ok] : ok.slice(0, 1));
  };
  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-semibold text-muted-foreground" id={`${id}-label`}>{label}</p>
      <label htmlFor={id}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); add(e.dataTransfer.files); }}
        className={cn(
          "flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-6 text-center transition-colors",
          "has-[:focus-visible]:border-ring has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50",
          over ? "border-primary bg-primary-950" : "border-border bg-muted hover:border-subtle-foreground",
        )}>
        <UploadIcon aria-hidden="true" className={cn("size-6.5", over ? "text-primary" : "text-subtle-foreground")} />
        <span className="text-15 font-semibold"><span className="text-primary">Choose {multiple ? "files" : "a file"}</span><span className="hidden sm:inline"> or drop {multiple ? "them" : "it"} here</span></span>
        {hint && <span className="text-sm text-subtle-foreground">{hint}</span>}
        <input id={id} type="file" accept={accept} multiple={multiple} aria-labelledby={`${id}-label`} className="sr-only"
          onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
      </label>
      {refused.length > 0 && (
        <ul className="space-y-1" aria-live="polite">
          {refused.map((r) => <li key={r} className="text-sm font-semibold text-highlight">{r}</li>)}
        </ul>
      )}
      {files.length > 0 && (
        <Card asChild className="divide-etched gap-0 overflow-hidden py-0"><ul>
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="flex min-h-14 items-center gap-3 py-1.5 pl-4 pr-1.5">
              <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted font-mono text-10 font-bold uppercase text-subtle-foreground">
                {f.name.split(".").pop()?.slice(0, 4)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-15 font-semibold">{f.name}</span>
                <span className="block text-xs text-subtle-foreground">{fileSize(f.size)}</span>
              </span>
              <Button variant="ghost" onClick={() => onChange(files.filter((_, j) => j !== i))} className="shrink-0">Remove</Button>
            </li>
          ))}
        </ul></Card>
      )}
    </div>
  );
}

/**
 * How a condition joins its rule. `all`: every one must hold, each narrows
 * (accent dot). `any`: at least one must hold, an "or" group (support dot).
 * `not`: anything that matches is left out (highlight dot).
 */
export type ConditionKind = "all" | "any" | "not";

const CONDITION_DOT: Record<ConditionKind, string> = { all: "dot-primary", any: "dot-support", not: "dot-highlight" };
const CONDITION_TITLE: Record<ConditionKind, string> = { all: "All of", any: "Any of", not: "Except" };

export interface ConditionChip {
  id: string;
  /** What the condition says ("Size: large", "Made after 2020"). */
  label: ReactNode;
  /** Makes the chip's text a button that opens the condition to change it. */
  onEdit?: () => void;
  onRemove: () => void;
  /** The × button's name for screen readers ("Remove Size: large"). */
  removeLabel: string;
}

export interface ConditionRow {
  kind: ConditionKind;
  /** The row's label; "All of", "Any of" or "Except" by default. */
  title?: string;
  chips: ConditionChip[];
}

/**
 * A rule's conditions (a filter, a saved search, an automation) as rows of
 * chips, one row per way they join: "All of", "Any of", "Except". Each row's
 * label has a dot in its colour, so the row reads by its words as well as
 * its colour. A chip's text edits it (`onEdit`), its × removes it. Rows with
 * no chips aren't drawn, and nothing is when every row is empty — show your
 * own empty line or the control that adds the first condition.
 *
 * Data-agnostic: the page says what each chip is and does, and keeps the
 * rule (in the URL where it's a view, N1). Adding a condition is the
 * page's own control (a `Menu`, a `Popover` or a `Sheet` of fields).
 */
export function ConditionGroup({ rows, className }: { rows: ConditionRow[]; className?: string }) {
  const shown = rows.filter((r) => r.chips.length);
  if (!shown.length) return null;
  return (
    <div className={cn("space-y-2", className)}>
      {shown.map((r, i) => {
        const title = r.title ?? CONDITION_TITLE[r.kind];
        return (
          <div key={`${r.kind}-${i}`} role="group" aria-label={title} className="flex min-w-0 flex-wrap items-center gap-2">
            <p aria-hidden="true" className="eyebrow flex w-full items-center gap-1.5 sm:w-20 sm:shrink-0">
              <span className={cn(CONDITION_DOT[r.kind], "size-2 shrink-0")} />{title}
            </p>
            {r.chips.map((c) => (
              <Badge key={c.id} variant="secondary" className="max-w-full gap-0 py-0 pr-0 pl-1">
                {c.onEdit
                  ? <Button size="sm" variant="ghost" className="min-w-0 max-w-full px-2" onClick={c.onEdit}>
                      <span className="min-w-0 truncate">{c.label}</span>
                    </Button>
                  : <span className="min-w-0 truncate px-2">{c.label}</span>}
                <Button size="icon" variant="ghost" aria-label={c.removeLabel} onClick={c.onRemove}><XIcon /></Button>
              </Badge>
            ))}
          </div>
        );
      })}
    </div>
  );
}

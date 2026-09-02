import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { CasEntryDTO } from "@/lib/apiEntries";
import type { EntryKind } from "@/lib/casModel";

export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export const STRAND_META: Record<
  EntryKind,
  {
    label: string;
    href: string;
    color: string;
    description: string;
  }
> = {
  creativity: {
    label: "Creativity",
    href: "/creativity",
    color: "var(--chart-1)",
    description: "Design, making, ideation, and experimentation.",
  },
  activity: {
    label: "Activity",
    href: "/activity",
    color: "var(--chart-2)",
    description: "Training, movement, discipline, and physical growth.",
  },
  service: {
    label: "Service",
    href: "/service",
    color: "var(--chart-3)",
    description: "Community work, responsibility, and practical help.",
  },
  project: {
    label: "Project Week",
    href: "/project",
    color: "var(--chart-5)",
    description: "Collaborative project week planning, execution, and outcomes.",
  },
  conversation: {
    label: "Conversations",
    href: "/conversations",
    color: "var(--chart-4)",
    description: "Recorded reflections and formal CAS check-ins.",
  },
};

function toneStyle(color: string): CSSProperties {
  return {
    borderColor: `color-mix(in oklab, ${color} 34%, var(--border))`,
    backgroundColor: `color-mix(in oklab, ${color} 12%, var(--card))`,
    color: "var(--foreground)",
  };
}

export function formatDisplayDate(date: string | Date) {
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  aside,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="site-panel animate-rise relative overflow-hidden px-6 py-7 sm:px-8 sm:py-9 lg:px-10">
      <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-primary/14 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 rounded-full bg-chart-3/20 blur-3xl" />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-end">
        <div className="relative">
          <p className="kicker">{eyebrow}</p>
          <h1 className="mt-4 max-w-4xl font-serif text-4xl tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            {description}
          </p>
          {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
        </div>

        {aside ? <div className="soft-panel relative p-5">{aside}</div> : null}
      </div>
    </section>
  );
}

export function StrandBadge({ kind }: { kind: EntryKind }) {
  const meta = STRAND_META[kind];

  return (
    <span
      className="inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-[0.68rem] uppercase tracking-[0.22em]"
      style={toneStyle(meta.color)}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: meta.color }}
      />
      {meta.label}
    </span>
  );
}

export function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="soft-panel p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-serif text-3xl text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function StrandLinkCard({
  kind,
  count,
}: {
  kind: EntryKind;
  count: number;
}) {
  const meta = STRAND_META[kind];

  return (
    <Link
      href={meta.href}
      className="site-panel group block h-full p-5 transition hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span
            className="inline-flex rounded-full border px-3 py-1 text-[0.68rem] uppercase tracking-[0.22em]"
            style={toneStyle(meta.color)}
          >
            {meta.label}
          </span>
          <h2 className="mt-4 font-serif text-2xl text-foreground">
            {count} {count === 1 ? "entry" : "entries"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {meta.description}
          </p>
        </div>

        <div
          className="h-12 w-12 rounded-full border"
          style={{
            ...toneStyle(meta.color),
            backgroundColor: `color-mix(in oklab, ${meta.color} 18%, var(--card))`,
          }}
        />
      </div>

      <p className="mt-6 text-sm font-medium text-foreground/80">
        Explore strand
      </p>
    </Link>
  );
}

export function EntryCard({
  entry,
  featured = false,
}: {
  entry: CasEntryDTO;
  featured?: boolean;
}) {
  const firstImage = entry.media.find((item) => item.kind === "image");
  const audioItems = entry.media.filter((item) => item.kind === "audio");
  const dateToShow = entry.entryDate || entry.createdAt;

  return (
    <article
      className={cn(
        "site-panel overflow-hidden p-5 sm:p-6",
        featured && "lg:col-span-2"
      )}
    >
      {firstImage ? (
        <div className="overflow-hidden rounded-[1.55rem] border border-border/70 bg-background/70">
          <Image
            src={firstImage.url}
            alt={firstImage.name}
            width={1600}
            height={1000}
            className={cn(
              "w-full object-cover",
              featured ? "max-h-[28rem] min-h-72" : "max-h-[22rem] min-h-64"
            )}
          />
        </div>
      ) : null}

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StrandBadge kind={entry.kind} />
            <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {formatDisplayDate(dateToShow)}
              {entry.week ? ` · Week ${entry.week}` : ""}
            </span>
          </div>
          <h3 className="mt-4 font-serif text-2xl tracking-tight text-foreground">
            {entry.title}
          </h3>
        </div>

        <div className="rounded-full border border-border/70 bg-background/75 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {entry.media.length} {entry.media.length === 1 ? "asset" : "assets"}
        </div>
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-muted-foreground sm:text-[0.98rem]">
        {entry.description}
      </p>

      {audioItems.length > 0 ? (
        <div className="mt-5 grid gap-3">
          {audioItems.map((audio, index) => (
            <div key={audio.url} className="soft-panel p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Audio {index + 1} · {audio.name}
              </p>
              <audio controls src={audio.url} className="mt-3 w-full" />
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="site-panel p-6 sm:p-7">
      <p className="kicker">No entries yet</p>
      <h2 className="mt-3 font-serif text-2xl text-foreground">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="site-panel border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
      Failed to load entries: {message}
    </div>
  );
}

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="site-panel p-6 text-sm text-muted-foreground">{label}</div>
  );
}

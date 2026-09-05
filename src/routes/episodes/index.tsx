import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { EpisodeCard } from "@/components/site/EpisodeCard";
import { Reveal } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { episodesQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/episodes/")({
  head: () => ({
    meta: [
      { title: "Episodes — Next Step podcast" },
      {
        name: "description",
        content: "Browse conversations, stories and ideas from the Next Step podcast.",
      },
      { property: "og:title", content: "Episodes — Next Step podcast" },
      {
        property: "og:description",
        content: "Every published Next Step conversation, searchable by topic and guest.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(episodesQuery({})),
  component: EpisodesPage,
});

const PAGE_SIZE = 9;

function EpisodesPage() {
  const { data: all } = useSuspenseQuery(episodesQuery({}));
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const categories = useMemo(
    () => Array.from(new Set(all.map((e) => e.category).filter((c): c is string => !!c))).sort(),
    [all],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const rows = all.filter((episode) => {
      const matchesCategory = category === "all" || episode.category === category;
      if (!matchesCategory) return false;
      if (!term) return true;
      return [episode.title, episode.description, episode.short_description, episode.guest?.name]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(term));
    });
    return sort === "oldest" ? [...rows].reverse() : rows;
  }, [all, search, category, sort]);

  const shown = filtered.slice(0, visible);

  return (
    <div className="container-editorial py-14 md:py-20">
      <Reveal className="max-w-2xl">
        <p className="eyebrow">The archive</p>
        <h1 className="mt-4 text-[clamp(2.6rem,6vw,4.5rem)] uppercase">Episodes</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Browse conversations, stories and ideas from Next Step.
        </p>
      </Reveal>

      <div className="mt-10 flex flex-col gap-4 border-y border-border py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setVisible(PAGE_SIZE);
            }}
            placeholder="Search episodes or guests"
            aria-label="Search episodes"
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {["all", ...categories].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setCategory(option);
                setVisible(PAGE_SIZE);
              }}
              aria-pressed={category === option}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                category === option
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary hover:text-primary",
              )}
            >
              {option === "all" ? "All topics" : option}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setSort((value) => (value === "newest" ? "oldest" : "newest"))}
            className="rounded-full border border-border px-3.5 py-1.5 text-sm font-medium hover:border-primary hover:text-primary"
          >
            {sort === "newest" ? "Newest first" : "Oldest first"}
          </button>
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="mt-16 rounded-lg border border-dashed border-primary/50 bg-cream p-12 text-center">
          <h2 className="text-3xl uppercase">
            {all.length === 0 ? "No episodes here yet." : "Nothing matches that search."}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {all.length === 0 ? "Check back for the next step." : "Try another word or topic."}
          </p>
        </div>
      ) : (
        <>
          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((episode, index) => (
              <Reveal key={episode.id} delay={(index % 3) * 70}>
                <EpisodeCard episode={episode} />
              </Reveal>
            ))}
          </div>
          {visible < filtered.length ? (
            <div className="mt-12 flex justify-center">
              <Button variant="outline" onClick={() => setVisible((value) => value + PAGE_SIZE)}>
                Load more episodes
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

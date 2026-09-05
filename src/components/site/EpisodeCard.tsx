import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Play } from "lucide-react";

import coverFallback from "@/assets/episode-placeholder.jpg";
import type { Episode } from "@/lib/content-types";
import { episodeLabel, formatDate, formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

export function EpisodeCard({ episode, className }: { episode: Episode; className?: string }) {
  const duration = formatDuration(episode.duration_seconds);
  const date = formatDate(episode.publication_date);

  return (
    <article className={cn("group flex h-full flex-col", className)}>
      <Link
        to="/episodes/$slug"
        params={{ slug: episode.slug }}
        className="relative block overflow-hidden rounded-md border border-border bg-muted"
      >
        <img
          src={episode.cover_image_url || coverFallback}
          alt={`Cover artwork for ${episode.title}`}
          loading="lazy"
          width={1024}
          height={1024}
          className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {episode.episode_number != null ? (
          <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-semibold tracking-wider">
            {episodeLabel(episode.episode_number)}
          </span>
        ) : null}
        <span className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Play className="h-4 w-4" aria-hidden="true" />
        </span>
      </Link>

      <div className="flex flex-1 flex-col pt-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {episode.category ? <span className="font-semibold text-primary">{episode.category}</span> : null}
          {date ? <span>{date}</span> : null}
          {duration ? <span>{duration}</span> : null}
        </div>
        <h3 className="mt-2 text-xl">
          <Link
            to="/episodes/$slug"
            params={{ slug: episode.slug }}
            className="transition-colors group-hover:text-primary"
          >
            {episode.title}
          </Link>
        </h3>
        {episode.guest?.name ? (
          <p className="mt-1 text-sm font-medium text-foreground/70">with {episode.guest.name}</p>
        ) : null}
        {episode.short_description || episode.description ? (
          <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
            {episode.short_description || episode.description}
          </p>
        ) : null}
        <Link
          to="/episodes/$slug"
          params={{ slug: episode.slug }}
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary"
        >
          Listen
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </article>
  );
}

import { queryOptions } from "@tanstack/react-query";

import { getEpisodeBySlug, getEpisodes, getGuests, getHomeData, getSettings } from "./content.functions";

export const settingsQuery = queryOptions({
  queryKey: ["settings"],
  queryFn: () => getSettings(),
  staleTime: 60_000,
});

export const homeQuery = queryOptions({
  queryKey: ["home"],
  queryFn: () => getHomeData(),
  staleTime: 30_000,
});

export const episodesQuery = (filters: {
  search?: string;
  category?: string;
  guest?: string;
  sort?: "newest" | "oldest";
}) =>
  queryOptions({
    queryKey: ["episodes", filters],
    queryFn: () => getEpisodes({ data: filters }),
    staleTime: 30_000,
  });

export const episodeQuery = (slug: string) =>
  queryOptions({
    queryKey: ["episode", slug],
    queryFn: () => getEpisodeBySlug({ data: { slug } }),
    staleTime: 30_000,
  });

export const guestsQuery = queryOptions({
  queryKey: ["guests"],
  queryFn: () => getGuests(),
  staleTime: 30_000,
});

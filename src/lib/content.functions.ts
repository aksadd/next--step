import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { EPISODE_COLUMNS, GUEST_COLUMNS } from "./content-types";
import type { Episode, Guest, Settings } from "./content-types";
import { looksLikeSpam, publicServerClient, rateLimit } from "./content.server";

const GUEST_JOIN = "guest:guests(id,name,slug,image_url,role)";

function asSettings(rows: { key: string; value: string | null }[] | null): Settings {
  const out: Settings = {};
  for (const row of rows ?? []) out[row.key] = row.value ?? "";
  return out;
}

export const getSettings = createServerFn({ method: "GET" }).handler(async (): Promise<Settings> => {
  const supabase = publicServerClient();
  const { data, error } = await supabase.from("site_settings").select("key,value");
  if (error) throw new Error(error.message);
  return asSettings(data as { key: string; value: string | null }[]);
});

export const getHomeData = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicServerClient();
  const [settingsRes, episodesRes, guestsRes] = await Promise.all([
    supabase.from("site_settings").select("key,value"),
    supabase
      .from("episodes")
      .select(`${EPISODE_COLUMNS},${GUEST_JOIN}`)
      .eq("published", true)
      .order("publication_date", { ascending: false, nullsFirst: false })
      .order("episode_number", { ascending: false, nullsFirst: false })
      .limit(9),
    supabase
      .from("guests")
      .select(GUEST_COLUMNS)
      .eq("published", true)
      .order("featured", { ascending: false })
      .order("name")
      .limit(6),
  ]);

  if (settingsRes.error) throw new Error(settingsRes.error.message);
  if (episodesRes.error) throw new Error(episodesRes.error.message);
  if (guestsRes.error) throw new Error(guestsRes.error.message);

  const episodes = (episodesRes.data ?? []) as unknown as Episode[];
  const featured = episodes.find((e) => e.featured) ?? episodes[0] ?? null;

  return {
    settings: asSettings(settingsRes.data as { key: string; value: string | null }[]),
    featured,
    episodes: episodes.filter((e) => e.id !== featured?.id),
    guests: (guestsRes.data ?? []) as unknown as Guest[],
  };
});

export const getEpisodes = createServerFn({ method: "GET" })
  .validator((data: unknown) =>
    z
      .object({
        search: z.string().max(120).optional(),
        category: z.string().max(60).optional(),
        guest: z.string().max(80).optional(),
        sort: z.enum(["newest", "oldest"]).optional(),
      })
      .parse(data ?? {}),
  )
  .handler(async ({ data }) => {
    const supabase = publicServerClient();
    let query = supabase
      .from("episodes")
      .select(`${EPISODE_COLUMNS},${GUEST_JOIN}`)
      .eq("published", true);

    if (data.category) query = query.eq("category", data.category);
    if (data.guest) query = query.eq("guest_id", data.guest);
    if (data.search) {
      const term = data.search.replace(/[%,()]/g, " ").trim();
      if (term) query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
    }

    const ascending = data.sort === "oldest";
    const { data: rows, error } = await query
      .order("publication_date", { ascending, nullsFirst: false })
      .order("episode_number", { ascending, nullsFirst: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return (rows ?? []) as unknown as Episode[];
  });

export const getEpisodeBySlug = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ slug: z.string().min(1).max(120) }).parse(data))
  .handler(async ({ data }) => {
    const supabase = publicServerClient();
    const [episodeRes, settingsRes] = await Promise.all([
      supabase
        .from("episodes")
        .select(`${EPISODE_COLUMNS},${GUEST_JOIN}`)
        .eq("slug", data.slug)
        .eq("published", true)
        .maybeSingle(),
      supabase.from("site_settings").select("key,value"),
    ]);
    if (episodeRes.error) throw new Error(episodeRes.error.message);
    const episode = (episodeRes.data ?? null) as unknown as Episode | null;

    let related: Episode[] = [];
    if (episode) {
      const { data: rel } = await supabase
        .from("episodes")
        .select(`${EPISODE_COLUMNS},${GUEST_JOIN}`)
        .eq("published", true)
        .neq("id", episode.id)
        .order("publication_date", { ascending: false, nullsFirst: false })
        .limit(3);
      related = (rel ?? []) as unknown as Episode[];
    }

    return {
      episode,
      related,
      settings: asSettings(settingsRes.data as { key: string; value: string | null }[]),
    };
  });

export const getGuests = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicServerClient();
  const [guestsRes, episodesRes] = await Promise.all([
    supabase
      .from("guests")
      .select(GUEST_COLUMNS)
      .eq("published", true)
      .order("featured", { ascending: false })
      .order("name"),
    supabase
      .from("episodes")
      .select("id,title,slug,episode_number,guest_id,publication_date")
      .eq("published", true)
      .order("publication_date", { ascending: false, nullsFirst: false }),
  ]);
  if (guestsRes.error) throw new Error(guestsRes.error.message);
  if (episodesRes.error) throw new Error(episodesRes.error.message);
  return {
    guests: (guestsRes.data ?? []) as unknown as Guest[],
    episodes: (episodesRes.data ?? []) as {
      id: string;
      title: string;
      slug: string;
      episode_number: number | null;
      guest_id: string | null;
    }[],
  };
});

/* ---------------- public form submissions (validated server-side) ---------------- */

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  subject: z.string().trim().max(160).optional().or(z.literal("")),
  reason: z.enum([
    "General question",
    "Guest suggestion",
    "Collaboration",
    "Media/press",
    "Partnership",
    "Other",
  ]),
  message: z.string().trim().min(10).max(4000),
  website: z.string().trim().max(200).optional().or(z.literal("")),
  consent: z.literal(true),
});

export const submitContactMessage = createServerFn({ method: "POST" })
  .validator((data: unknown) => contactSchema.parse(data))
  .handler(async ({ data }) => {
    if (!rateLimit(`contact:${data.email.toLowerCase()}`, 3)) {
      throw new Error("You have already sent a few messages. Please wait a little while.");
    }
    if (looksLikeSpam(`${data.message} ${data.subject ?? ""}`)) {
      throw new Error("This message looks like spam. Please remove extra links and try again.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("messages").insert({
      name: data.name,
      email: data.email,
      subject: data.subject || null,
      reason: data.reason,
      message: data.message,
      website: data.website || null,
    });
    if (error) throw new Error("We could not send your message. Please try again.");
    return { ok: true };
  });

const suggestionSchema = z.object({
  submitter_name: z.string().trim().min(2).max(120),
  submitter_email: z.string().trim().email().max(180),
  guest_name: z.string().trim().min(2).max(160),
  reason: z.string().trim().min(10).max(2000),
  links: z.string().trim().max(500).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  consent: z.literal(true),
});

export const submitGuestSuggestion = createServerFn({ method: "POST" })
  .validator((data: unknown) => suggestionSchema.parse(data))
  .handler(async ({ data }) => {
    if (!rateLimit(`suggest:${data.submitter_email.toLowerCase()}`, 3)) {
      throw new Error("You have already sent a few suggestions. Please wait a little while.");
    }
    if (looksLikeSpam(`${data.reason} ${data.links ?? ""}`)) {
      throw new Error("This suggestion looks like spam. Please remove extra links and try again.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("guest_submissions").insert({
      submitter_name: data.submitter_name,
      submitter_email: data.submitter_email,
      guest_name: data.guest_name,
      reason: data.reason,
      links: data.links || null,
      message: data.message || null,
    });
    if (error) throw new Error("We could not send your suggestion. Please try again.");
    return { ok: true };
  });

export const subscribeToNewsletter = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        email: z.string().trim().email().max(180),
        first_name: z.string().trim().max(80).optional().or(z.literal("")),
        consent: z.literal(true),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const email = data.email.toLowerCase();
    if (!rateLimit(`news:${email}`, 3)) {
      throw new Error("Please wait a moment before trying again.");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("newsletter_subscribers").upsert(
      {
        email,
        first_name: data.first_name || null,
        consent: true,
        active: true,
        unsubscribed_at: null,
      },
      { onConflict: "email" },
    );
    if (error) throw new Error("We could not add you to the list. Please try again.");
    return { ok: true };
  });

export const unsubscribeFromNewsletter = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({ email: z.string().trim().email().max(180) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .update({ active: false, unsubscribed_at: new Date().toISOString() })
      .eq("email", data.email.toLowerCase());
    if (error) throw new Error("We could not update your subscription.");
    return { ok: true };
  });

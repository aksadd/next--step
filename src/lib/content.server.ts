import { createClient } from "@supabase/supabase-js";

/** Public read/write client used inside server functions (no session, RLS applies as anon). */
export function publicServerClient() {
  const url = process.env["SUPABASE_URL"] ?? import.meta.env["VITE_SUPABASE_URL"];
  const key =
    process.env["SUPABASE_PUBLISHABLE_KEY"] ?? import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Backend is not configured yet.");

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

/** Very small in-memory throttle to slow down form spam per worker instance. */
const hits = new Map<string, number[]>();

export function rateLimit(bucket: string, limit = 5, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now();
  const list = (hits.get(bucket) ?? []).filter((t) => now - t < windowMs);
  if (list.length >= limit) {
    hits.set(bucket, list);
    return false;
  }
  list.push(now);
  hits.set(bucket, list);
  return true;
}

export function looksLikeSpam(text: string): boolean {
  const lower = text.toLowerCase();
  const linkCount = (lower.match(/https?:\/\//g) ?? []).length;
  return linkCount > 4 || /\b(viagra|casino|crypto giveaway|seo services)\b/.test(lower);
}

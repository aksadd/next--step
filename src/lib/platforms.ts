import type { Settings } from "./content-types";

export type PlatformLink = { key: string; name: string; description: string; url: string };

const PLATFORMS: Omit<PlatformLink, "url">[] = [
  { key: "spotify_url", name: "Spotify", description: "Stream every episode and follow the show." },
  { key: "apple_url", name: "Apple Podcasts", description: "Subscribe and get new episodes first." },
  { key: "youtube_url", name: "YouTube", description: "Watch the conversations in full." },
  { key: "youtube_music_url", name: "YouTube Music", description: "Listen while you do other things." },
  { key: "deezer_url", name: "Deezer", description: "Add Next Step to your library." },
  { key: "amazon_music_url", name: "Amazon Music", description: "Ask your speaker to play Next Step." },
];

const SOCIALS: { key: string; name: string }[] = [
  { key: "instagram_url", name: "Instagram" },
  { key: "tiktok_url", name: "TikTok" },
  { key: "youtube_url", name: "YouTube" },
  { key: "linkedin_url", name: "LinkedIn" },
  { key: "facebook_url", name: "Facebook" },
  { key: "x_url", name: "X" },
];

const isUrl = (value?: string) => !!value && /^https?:\/\//i.test(value.trim());

export function activePlatforms(settings: Settings | undefined): PlatformLink[] {
  if (!settings) return [];
  return PLATFORMS.filter((p) => isUrl(settings[p.key])).map((p) => ({
    ...p,
    url: settings[p.key]!.trim(),
  }));
}

export function activeSocials(settings: Settings | undefined): { key: string; name: string; url: string }[] {
  if (!settings) return [];
  return SOCIALS.filter((s) => isUrl(settings[s.key])).map((s) => ({ ...s, url: settings[s.key]!.trim() }));
}

export const PLATFORM_KEYS = PLATFORMS.map((p) => p.key);
export const SOCIAL_KEYS = SOCIALS.map((s) => s.key);

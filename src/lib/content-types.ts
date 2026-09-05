export type Guest = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  short_bio: string | null;
  long_bio: string | null;
  role: string | null;
  website_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  youtube_url: string | null;
  featured: boolean;
  published: boolean;
};

export type Episode = {
  id: string;
  episode_number: number | null;
  title: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  guest_id: string | null;
  cover_image_url: string | null;
  audio_url: string | null;
  video_url: string | null;
  spotify_url: string | null;
  apple_url: string | null;
  youtube_url: string | null;
  publication_date: string | null;
  duration_seconds: number | null;
  category: string | null;
  tags: string[];
  transcript: string | null;
  featured: boolean;
  published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  guest?: Pick<Guest, "id" | "name" | "slug" | "image_url" | "role"> | null;
};

export type Settings = Record<string, string>;

export const EPISODE_COLUMNS =
  "id,episode_number,title,slug,description,short_description,guest_id,cover_image_url,audio_url,video_url,spotify_url,apple_url,youtube_url,publication_date,duration_seconds,category,tags,transcript,featured,published,seo_title,seo_description";

export const GUEST_COLUMNS =
  "id,name,slug,image_url,short_bio,long_bio,role,website_url,instagram_url,linkedin_url,youtube_url,featured,published";

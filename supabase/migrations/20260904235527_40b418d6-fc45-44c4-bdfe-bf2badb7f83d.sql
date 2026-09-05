-- roles
CREATE TYPE public.app_role AS ENUM ('admin','editor','user');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());

-- one-time admin bootstrap
CREATE OR REPLACE FUNCTION public.claim_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RETURN false; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN RETURN false; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin') ON CONFLICT DO NOTHING;
  RETURN true;
END; $$;
GRANT EXECUTE ON FUNCTION public.claim_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- guests
CREATE TABLE public.guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  image_url text,
  short_bio text,
  long_bio text,
  role text,
  website_url text,
  instagram_url text,
  linkedin_url text,
  youtube_url text,
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.guests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guests TO authenticated;
GRANT ALL ON public.guests TO service_role;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "published guests public" ON public.guests FOR SELECT TO anon, authenticated USING (published = true OR public.is_admin());
CREATE POLICY "admins manage guests" ON public.guests FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER guests_touch BEFORE UPDATE ON public.guests FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- episodes
CREATE TABLE public.episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_number integer,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  short_description text,
  guest_id uuid REFERENCES public.guests(id) ON DELETE SET NULL,
  cover_image_url text,
  audio_url text,
  video_url text,
  spotify_url text,
  apple_url text,
  youtube_url text,
  publication_date date,
  duration_seconds integer,
  category text,
  tags text[] NOT NULL DEFAULT '{}',
  transcript text,
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT false,
  seo_title text,
  seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.episodes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.episodes TO authenticated;
GRANT ALL ON public.episodes TO service_role;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "published episodes public" ON public.episodes FOR SELECT TO anon, authenticated USING (published = true OR public.is_admin());
CREATE POLICY "admins manage episodes" ON public.episodes FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER episodes_touch BEFORE UPDATE ON public.episodes FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- messages
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  reason text,
  message text NOT NULL,
  website text,
  status text NOT NULL DEFAULT 'unread',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read messages" ON public.messages FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "admins update messages" ON public.messages FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admins delete messages" ON public.messages FOR DELETE TO authenticated USING (public.is_admin());

-- guest submissions
CREATE TABLE public.guest_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submitter_name text NOT NULL,
  submitter_email text NOT NULL,
  guest_name text NOT NULL,
  reason text,
  links text,
  message text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.guest_submissions TO authenticated;
GRANT ALL ON public.guest_submissions TO service_role;
ALTER TABLE public.guest_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read submissions" ON public.guest_submissions FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "admins update submissions" ON public.guest_submissions FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admins delete submissions" ON public.guest_submissions FOR DELETE TO authenticated USING (public.is_admin());

-- newsletter
CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  first_name text,
  consent boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  subscribed_at timestamptz NOT NULL DEFAULT now(),
  unsubscribed_at timestamptz
);
GRANT SELECT, UPDATE, DELETE ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read subscribers" ON public.newsletter_subscribers FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "admins update subscribers" ON public.newsletter_subscribers FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admins delete subscribers" ON public.newsletter_subscribers FOR DELETE TO authenticated USING (public.is_admin());

-- site settings
CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings public read" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage settings" ON public.site_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER settings_touch BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.site_settings (key, value) VALUES
  ('podcast_name', 'Next Step'),
  ('tagline', 'Every story starts with a next step.'),
  ('hero_eyebrow', 'THE NEXT STEP PODCAST'),
  ('description', 'Next Step is a conversation podcast about the decisions, stories and small moves that change a path. [TO VERIFY: replace with the official podcast description.]'),
  ('about_podcast', 'Next Step is a podcast built around honest conversations. Each episode looks at how people got where they are, what they were unsure about, and the one step that moved them forward. [TO VERIFY: replace with the official About text.]'),
  ('host_name', 'Minna Khadidja Bensalah'),
  ('host_bio', '[TO VERIFY] Minna Khadidja Bensalah hosts Next Step. Add her real biography from the admin area before launch.'),
  ('host_image_url', ''),
  ('hero_image_url', ''),
  ('contact_email', ''),
  ('contact_phone', ''),
  ('location', ''),
  ('footer_text', 'An independent podcast about the next step.'),
  ('instagram_url', ''),
  ('tiktok_url', ''),
  ('youtube_url', ''),
  ('linkedin_url', ''),
  ('facebook_url', ''),
  ('x_url', ''),
  ('spotify_url', ''),
  ('apple_url', ''),
  ('deezer_url', ''),
  ('amazon_music_url', ''),
  ('youtube_music_url', ''),
  ('newsletter_enabled', 'true'),
  ('guests_section_enabled', 'true'),
  ('recent_episodes_count', '6'),
  ('cta_primary_label', 'Listen to the latest episode'),
  ('cta_secondary_label', 'Explore episodes'),
  ('seo_title', 'Next Step — the podcast'),
  ('seo_description', 'Conversations, stories and ideas from the Next Step podcast, hosted by Minna Khadidja Bensalah.'),
  ('analytics_ga4_id', ''),
  ('analytics_plausible_domain', '');

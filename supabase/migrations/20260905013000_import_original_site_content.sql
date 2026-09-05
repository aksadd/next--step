-- Confirmed copy and contact details imported from https://nextstep2026.my.canva.site/
-- Social handles are stored as display text because the source did not confirm platform URLs.
INSERT INTO public.site_settings (key, value) VALUES
  ('podcast_name', 'Next Step'),
  ('tagline', 'Dream big. Take your next step.'),
  ('hero_eyebrow', 'NEXT STEP'),
  ('description', 'Next Step is a motivational YouTube channel and digital platform dedicated to empowering young people to unlock their potential and build a brighter future.'),
  ('about_podcast', 'Through inspiring stories, practical resources, and personal growth content, we show that it’s never too late to change your life and achieve your goals. At Next Step, we believe in second chances, growth, and the power of determination. This is the place where motivation meets action — helping you take the next step toward success.'),
  ('host_name', 'Minna Khadidja Bensalah'),
  ('host_bio', 'I’m Minna Khadidja Bensalah, a 17-year-old student from Algeria, passionate about learning, creating, and exploring new opportunities. My journey has been shaped by experiences in volunteering, cultural exchange, and leadership programs that taught me the value of responsibility, respect, and collaboration. For me, every project, every trip, and every program is not just an activity — it’s a chance to learn, inspire, and make a difference.'),
  ('contact_email', 'nexts8929@gmail.com'),
  ('footer_text', 'Inspiring growth, building skills and creating opportunities for young people.'),
  ('social_handles', '@next_step2026 · @NEXT_STEP26')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

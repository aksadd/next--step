import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Play } from "lucide-react";

import heroImage from "@/assets/hero-editorial.jpg";
import coverFallback from "@/assets/episode-placeholder.jpg";
import founderImage from "@/assets/minna-community.jpg";
import sourceBackground from "@/assets/next-step-background.jpg";
import missionImage from "@/assets/next-step-mission.png";
import growthImage from "@/assets/next-step-growth.png";
import learningImage from "@/assets/next-step-learning.jpg";
import opportunityImage from "@/assets/next-step-opportunities.jpg";
import { AudioPlayer } from "@/components/site/AudioPlayer";
import { ContentText } from "@/components/site/ContentText";
import { EpisodeCard } from "@/components/site/EpisodeCard";
import { NewsletterForm } from "@/components/site/NewsletterForm";
import { Reveal } from "@/components/site/Reveal";
import { Waveform } from "@/components/site/Waveform";
import { Button } from "@/components/ui/button";
import { episodeLabel, formatDate, formatDuration } from "@/lib/format";
import { activePlatforms } from "@/lib/platforms";
import { homeQuery } from "@/lib/queries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Next Step — a podcast about the step that changes things" },
      {
        name: "description",
        content:
          "Next Step is a conversation podcast hosted by Minna Khadidja Bensalah about stories, doubts and the small decisions that move people forward.",
      },
      { property: "og:title", content: "Next Step — the podcast" },
      {
        property: "og:description",
        content: "Conversations, stories and ideas from the Next Step podcast.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(homeQuery),
  component: Home,
});

function Home() {
  const { data } = useSuspenseQuery(homeQuery);
  const { settings, featured, episodes, guests } = data;
  const platforms = activePlatforms(settings);
  const recentCount = Number(settings["recent_episodes_count"] || 6);
  const recent = episodes.slice(0, Math.max(3, Math.min(6, recentCount)));
  const showGuests = settings["guests_section_enabled"] !== "false" && guests.length > 0;
  const showNewsletter = settings["newsletter_enabled"] !== "false";

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-cover bg-center" style={{ backgroundImage: `linear-gradient(rgb(255 255 255 / 82%), rgb(255 255 255 / 92%)), url(${sourceBackground})` }}>
        <div className="container-editorial grid items-center gap-12 py-14 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">{settings["hero_eyebrow"] || "THE NEXT STEP PODCAST"}</p>
            <h1 className="mt-5 text-[clamp(2.6rem,7vw,5rem)] uppercase">
              {settings["tagline"] || "Every story starts with a next step."}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              {settings["description"] ||
                "Honest conversations about the moments people almost didn't take."}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {featured ? (
                <Button asChild size="lg">
                  <Link to="/episodes/$slug" params={{ slug: featured.slug }}>
                    <Play className="mr-2 h-4 w-4" />
                    {settings["cta_primary_label"] || "Listen to the latest episode"}
                  </Link>
                </Button>
              ) : (
                <Button asChild size="lg">
                  <Link to="/listen">Where to listen</Link>
                </Button>
              )}
              <Button asChild size="lg" variant="outline">
                <Link to="/episodes">{settings["cta_secondary_label"] || "Explore episodes"}</Link>
              </Button>
            </div>
            <div className="mt-10 flex items-center gap-4">
              <Waveform animated className="h-6 w-40" />
              <p className="text-sm text-muted-foreground">
                Hosted by {settings["host_name"] || "Minna Khadidja Bensalah"}
              </p>
            </div>
          </Reveal>

          <Reveal delay={120} className="relative">
            <div className="absolute -left-6 top-6 hidden h-24 w-24 rounded-full bg-primary/15 lg:block" />
            <img
              src={settings["hero_image_url"] || founderImage || heroImage}
              alt="A Next Step community volunteer looking toward an open field"
              width={1280}
              height={1280}
              className="relative w-full rounded-lg border border-border object-cover shadow-lift"
            />
            {featured ? (
              <Link
                to="/episodes/$slug"
                params={{ slug: featured.slug }}
                className="surface-card absolute -bottom-6 left-4 right-4 flex items-center gap-3 rounded-md p-3 sm:left-6 sm:right-auto sm:max-w-xs"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Play className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-semibold tracking-widest text-primary">
                    LATEST
                  </span>
                  <span className="block truncate text-sm font-semibold">{featured.title}</span>
                </span>
              </Link>
            ) : null}
          </Reveal>
        </div>
      </section>

      {/* MARQUEE */}
      <section aria-hidden="true" className="overflow-hidden border-y border-border bg-cream py-4">
        <div className="marquee-track flex w-max gap-10 whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, group) => (
            <span key={group} className="flex gap-10">
              {["Conversations", "Stories", "Momentum", "Next Step", "Curiosity", "Next Step"].map(
                (word, index) => (
                  <span
                    key={`${group}-${index}`}
                    className="text-display text-2xl uppercase text-foreground/30"
                  >
                    {word} <span className="text-primary">→</span>
                  </span>
                ),
              )}
            </span>
          ))}
        </div>
      </section>

      {/* WHAT IS NEXT STEP */}
      <section className="container-editorial grid gap-10 py-20 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <p className="eyebrow">What is Next Step?</p>
          <h2 className="mt-4 text-[clamp(2.2rem,5vw,3.5rem)] uppercase">Take the next step.</h2>
          <div className="mt-6 h-0.5 w-24 bg-primary" />
        </Reveal>
        <Reveal delay={100}>
          <ContentText
            value={settings["about_podcast"]}
            className="text-lg leading-relaxed text-muted-foreground"
          />
          <Link
            to="/about"
            className="mt-6 inline-flex items-center gap-1.5 font-semibold text-primary hover:gap-2.5 transition-all"
          >
            More about the podcast <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </section>

      <section className="border-y border-border bg-cream py-20">
        <div className="container-editorial grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <Reveal>
            <img
              src={missionImage}
              alt="Next Step’s mission: sharing stories, developing skills and creating opportunities"
              loading="lazy"
              className="w-full rounded-lg border border-border bg-background"
            />
          </Reveal>
          <Reveal delay={100}>
            <p className="eyebrow">Our mission</p>
            <h2 className="mt-4 text-[clamp(2rem,4vw,3.3rem)] uppercase">Inspiring growth.<br />Building skills.<br /><span className="text-primary">Creating opportunities.</span></h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">At Next Step, we believe in second chances, growth, and the power of determination. This is where motivation meets action — helping young people take their next step toward success.</p>
          </Reveal>
        </div>
        <div className="container-editorial mt-12 grid gap-5 sm:grid-cols-3">
          {[{ title: "Inspiring growth", image: growthImage, alt: "Illustration of a young person" }, { title: "Building skills", image: learningImage, alt: "Illustration of learning" }, { title: "Creating opportunities", image: opportunityImage, alt: "Illustration of an opportunity" }].map((item, index) => (
            <Reveal key={item.title} delay={index * 80} className="surface-card overflow-hidden rounded-lg">
              <img src={item.image} alt={item.alt} loading="lazy" className="aspect-[4/3] w-full object-cover" />
              <p className="p-5 text-display text-xl uppercase">{item.title}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* LATEST EPISODE */}
      {featured ? (
        <section className="border-y border-border bg-cream py-20">
          <div className="container-editorial">
            <Reveal className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Latest episode</p>
                <h2 className="mt-3 text-4xl uppercase">Now playing</h2>
              </div>
              <Link to="/episodes" className="inline-flex items-center gap-1 font-semibold text-primary">
                All episodes <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Reveal>

            <Reveal delay={100} className="mt-10 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
              <img
                src={featured.cover_image_url || coverFallback}
                alt={`Cover artwork for ${featured.title}`}
                loading="lazy"
                width={1024}
                height={1024}
                className="aspect-square w-full rounded-lg border border-border object-cover"
              />
              <div className="flex flex-col">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  {featured.episode_number != null ? (
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      {episodeLabel(featured.episode_number)}
                    </span>
                  ) : null}
                  {featured.category ? <span className="font-semibold text-primary">{featured.category}</span> : null}
                  {formatDate(featured.publication_date) ? <span>{formatDate(featured.publication_date)}</span> : null}
                  {formatDuration(featured.duration_seconds) ? <span>{formatDuration(featured.duration_seconds)}</span> : null}
                </div>
                <h3 className="mt-4 text-[clamp(1.8rem,4vw,2.75rem)]">{featured.title}</h3>
                {featured.guest?.name ? (
                  <p className="mt-2 font-medium">with {featured.guest.name}</p>
                ) : null}
                {featured.short_description || featured.description ? (
                  <p className="mt-4 max-w-2xl text-muted-foreground">
                    {featured.short_description || featured.description}
                  </p>
                ) : null}
                <AudioPlayer src={featured.audio_url} title={featured.title} className="mt-6" />
                <div className="mt-5">
                  <Button asChild>
                    <Link to="/episodes/$slug" params={{ slug: featured.slug }}>
                      Play episode page
                    </Link>
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      ) : (
        <section className="container-editorial py-20">
          <Reveal className="surface-card rounded-lg p-10 text-center">
            <h2 className="text-3xl uppercase">No episodes here yet.</h2>
            <p className="mt-3 text-muted-foreground">
              Episodes added in the admin area appear here automatically.
            </p>
          </Reveal>
        </section>
      )}

      {/* EPISODE COLLECTION */}
      {recent.length > 0 ? (
        <section className="container-editorial py-20">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">The collection</p>
              <h2 className="mt-3 text-4xl uppercase">Recent conversations</h2>
            </div>
            <Link to="/episodes" className="inline-flex items-center gap-1 font-semibold text-primary">
              View all episodes <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
          <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((episode, index) => (
              <Reveal key={episode.id} delay={index * 70} as="div">
                <EpisodeCard episode={episode} />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {/* THE NEXT STEP IDEA */}
      <section className="border-y border-border bg-foreground py-24 text-background">
        <div className="container-editorial">
          <Reveal className="max-w-4xl space-y-6">
            <p className="eyebrow">The idea</p>
            <p className="text-display text-[clamp(1.9rem,5vw,3.4rem)] uppercase leading-[1.05]">
              A conversation can change how you see something.
              <br />
              <span className="text-primary">A story can make you try something.</span>
              <br />
              And sometimes, one small decision becomes the next step.
            </p>
            <Waveform animated className="h-10 w-56" bars={28} />
          </Reveal>
        </div>
      </section>

      {/* MINNA */}
      <section className="container-editorial grid gap-12 py-20 lg:grid-cols-[0.85fr_1.15fr]">
        <Reveal className="relative">
          {settings["host_image_url"] ? (
            <img
              src={settings["host_image_url"]}
              alt={settings["host_name"] || "Podcast host"}
              loading="lazy"
              className="w-full rounded-lg border border-border object-cover"
            />
          ) : <img src={founderImage} alt="Minna Khadidja Bensalah volunteering in the community" loading="lazy" className="aspect-[4/5] w-full rounded-lg border border-border object-cover" />}
        </Reveal>
        <Reveal delay={100}>
          <p className="eyebrow">The host</p>
          <h2 className="mt-4 text-[clamp(2rem,4.5vw,3.2rem)] uppercase">
            {settings["host_name"] || "Minna Khadidja Bensalah"}
          </h2>
          <ContentText value={settings["host_bio"]} className="mt-5 text-muted-foreground" />
          <Link
            to="/about"
            className="mt-6 inline-flex items-center gap-1.5 font-semibold text-primary transition-all hover:gap-2.5"
          >
            Meet Minna <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </section>

      {/* GUESTS */}
      {showGuests ? (
        <section className="border-t border-border bg-cream py-20">
          <div className="container-editorial">
            <Reveal className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Conversations with</p>
                <h2 className="mt-3 text-4xl uppercase">People on the show</h2>
              </div>
              <Link to="/guests" className="inline-flex items-center gap-1 font-semibold text-primary">
                All guests <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {guests.map((guest, index) => (
                <Reveal key={guest.id} delay={index * 70} as="article" className="group">
                  <Link to="/guests" className="block">
                    {guest.image_url ? (
                      <img
                        src={guest.image_url}
                        alt={guest.name}
                        loading="lazy"
                        className="aspect-[4/5] w-full rounded-md border border-border object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex aspect-[4/5] items-center justify-center rounded-md border border-border bg-background">
                        <span className="text-display text-4xl uppercase text-foreground/15">
                          {guest.name.slice(0, 2)}
                        </span>
                      </div>
                    )}
                    <h3 className="mt-4 text-xl group-hover:text-primary">{guest.name}</h3>
                    {guest.role ? <p className="text-sm text-muted-foreground">{guest.role}</p> : null}
                    {guest.short_bio ? (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{guest.short_bio}</p>
                    ) : null}
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* LISTEN EVERYWHERE */}
      <section className="container-editorial py-20">
        <Reveal>
          <p className="eyebrow">Listen everywhere</p>
          <h2 className="mt-3 text-4xl uppercase">Pick your player</h2>
        </Reveal>
        {platforms.length > 0 ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {platforms.map((platform, index) => (
              <Reveal key={platform.key} delay={index * 60}>
                <a
                  href={platform.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="surface-card group flex h-full items-start justify-between gap-4 rounded-lg p-5 transition-colors hover:border-primary"
                >
                  <span>
                    <span className="block text-lg font-semibold">{platform.name}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">{platform.description}</span>
                  </span>
                  <ArrowUpRight className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal className="mt-8 rounded-lg border border-dashed border-primary/50 bg-cream p-8">
            <p className="font-semibold">Listening links are not configured yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add the podcast's Spotify, Apple Podcasts or YouTube links in the admin area and they
              will appear here.
            </p>
          </Reveal>
        )}
      </section>

      {/* NEWSLETTER + CONTACT */}
      <section className="border-t border-border bg-cream py-20">
        <div className="container-editorial grid gap-12 lg:grid-cols-2">
          {showNewsletter ? (
            <Reveal>
              <p className="eyebrow">Updates</p>
              <h2 className="mt-3 text-4xl uppercase">Don't miss the next step.</h2>
              <p className="mt-3 text-muted-foreground">
                One short email when a new episode lands. Nothing else.
              </p>
              <div className="mt-6 max-w-lg">
                <NewsletterForm />
              </div>
            </Reveal>
          ) : null}
          <Reveal delay={100}>
            <p className="eyebrow">Get in touch</p>
            <h2 className="mt-3 text-4xl uppercase">Have something to say?</h2>
            <p className="mt-3 text-muted-foreground">
              Ask a question, suggest a topic, propose a guest or talk about working together.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/contact">Contact Next Step</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/contact" search={{ reason: "guest" }}>
                  Suggest a guest
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

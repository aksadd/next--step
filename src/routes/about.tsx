// @ts-nocheck
import { Link, createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { ContentText } from "@/components/site/ContentText";
import { Reveal } from "@/components/site/Reveal";
import { Waveform } from "@/components/site/Waveform";
import { settingsQuery } from "@/lib/queries";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — Next Step podcast" }, { name: "description", content: "The story behind Next Step and its host, Minna Khadidja Bensalah." }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQuery),
  component: About,
});

function About() {
  const { data: settings } = useSuspenseQuery(settingsQuery);
  const host = settings["host_name"] || "Minna Khadidja Bensalah";
  return <div className="container-editorial py-14 md:py-20">
    <Reveal className="max-w-4xl"><p className="eyebrow">The story so far</p><h1 className="mt-4 text-[clamp(2.8rem,7vw,5.5rem)] uppercase">About<br/><span className="text-primary">Next Step.</span></h1><Waveform animated className="mt-8 h-8 w-52" /></Reveal>
    <section className="mt-16 grid gap-12 border-t border-border pt-12 lg:grid-cols-[.8fr_1.2fr]"><Reveal><p className="eyebrow">The podcast</p><h2 className="mt-4 text-4xl uppercase">Conversations with momentum.</h2></Reveal><Reveal delay={100}><ContentText value={settings["about_podcast"]} className="text-lg leading-relaxed text-muted-foreground" /></Reveal></section>
    <section className="mt-20 grid gap-12 border-t border-border pt-12 lg:grid-cols-[.8fr_1.2fr]"><Reveal><p className="eyebrow">The host</p><h2 className="mt-4 text-4xl uppercase">{host}</h2></Reveal><Reveal delay={100}><ContentText value={settings["host_bio"]} className="text-lg leading-relaxed text-muted-foreground" /><Link to="/contact" className="mt-7 inline-flex items-center gap-2 font-semibold text-primary">Start a conversation <ArrowRight className="h-4 w-4" /></Link></Reveal></section>
  </div>;
}

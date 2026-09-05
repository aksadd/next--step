// @ts-nocheck
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/site/Reveal";
import { activePlatforms } from "@/lib/platforms";
import { settingsQuery } from "@/lib/queries";
export const Route = createFileRoute("/listen")({ loader: ({ context }) => context.queryClient.ensureQueryData(settingsQuery), component: Listen });
function Listen() { const { data: settings } = useSuspenseQuery(settingsQuery); const platforms = activePlatforms(settings); return <div className="container-editorial py-14 md:py-20"><Reveal><p className="eyebrow">Follow the conversation</p><h1 className="mt-4 text-[clamp(2.8rem,7vw,5rem)] uppercase">Listen<br/>everywhere.</h1><p className="mt-5 max-w-xl text-lg text-muted-foreground">Choose your favorite player and keep Next Step close.</p></Reveal>{platforms.length ? <div className="mt-14 grid gap-4 md:grid-cols-2">{platforms.map((p,i)=><Reveal key={p.key} delay={i*60}><a href={p.url} target="_blank" rel="noreferrer noopener" className="surface-card flex items-center justify-between rounded-lg p-7 transition-colors hover:border-primary"><span><b className="text-xl">{p.name}</b><span className="mt-1 block text-muted-foreground">{p.description}</span></span><ArrowUpRight className="text-primary" /></a></Reveal>)}</div> : <div className="mt-14 rounded-lg border border-dashed border-primary/50 bg-cream p-10"><h2 className="text-2xl uppercase">Links are on their way.</h2><p className="mt-2 text-muted-foreground">Official listening links will appear here when they are confirmed.</p></div>}</div>; }

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";

import { settingsQuery } from "@/lib/queries";
import { activePlatforms, activeSocials } from "@/lib/platforms";

export function SiteFooter() {
  const { data: settings } = useQuery(settingsQuery);
  const socials = activeSocials(settings);
  const platforms = activePlatforms(settings);
  const email = settings?.["contact_email"]?.trim();
  const location = settings?.["location"]?.trim();

  return (
    <footer className="mt-24 border-t border-border bg-cream">
      <div className="container-editorial grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <p className="text-display text-2xl uppercase">{settings?.["podcast_name"] || "Next Step"}</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            {settings?.["footer_text"] || "An independent podcast about the next step."}
          </p>
          <div className="h-0.5 w-16 bg-primary" />
        </div>

        <nav aria-label="Footer navigation" className="space-y-3 text-sm">
          <p className="eyebrow">Explore</p>
          {[
            { to: "/episodes", label: "Episodes" },
            { to: "/about", label: "About" },
            { to: "/guests", label: "Guests" },
            { to: "/contact", label: "Contact" },
          ].map((item) => (
            <Link key={item.to} to={item.to} className="block text-foreground/80 hover:text-primary">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="space-y-3 text-sm">
          <p className="eyebrow">Listen</p>
          {platforms.length === 0 ? (
            <p className="text-muted-foreground">
              Listening links are added from the admin area.
            </p>
          ) : (
            platforms.map((platform) => (
              <a
                key={platform.key}
                href={platform.url}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-1 text-foreground/80 hover:text-primary"
              >
                {platform.name}
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            ))
          )}
        </div>

        <div className="space-y-3 text-sm">
          <p className="eyebrow">Say hello</p>
          {email ? (
            <a href={`mailto:${email}`} className="flex items-center gap-2 text-foreground/80 hover:text-primary">
              <Mail className="h-4 w-4" /> {email}
            </a>
          ) : (
            <Link to="/contact" className="block text-foreground/80 hover:text-primary">
              Use the contact form
            </Link>
          )}
          {location ? (
            <p className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" /> {location}
            </p>
          ) : null}
          {socials.length > 0 ? (
            <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2">
              {socials.map((social) => (
                <a
                  key={social.key}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-foreground/80 hover:text-primary"
                >
                  {social.name}
                </a>
              ))}
            </div>
          ) : null}
          {settings?.["social_handles"] ? <p className="pt-2 text-muted-foreground">{settings["social_handles"]}</p> : null}
        </div>
      </div>

      <div className="container-editorial flex flex-col gap-3 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {settings?.["podcast_name"] || "Next Step"}. All rights reserved.
        </p>
        <div className="flex gap-5">
          <Link to="/privacy" className="hover:text-primary">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-primary">
            Terms
          </Link>
          <Link to="/admin" className="hover:text-primary">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}

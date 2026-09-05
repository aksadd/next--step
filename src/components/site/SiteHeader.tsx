import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import sourceLogo from "@/assets/next-step-logo.png";
import { settingsQuery } from "@/lib/queries";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/episodes", label: "Episodes" },
  { to: "/about", label: "About" },
  { to: "/guests", label: "Guests" },
  { to: "/listen", label: "Listen" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const { data: settings } = useQuery(settingsQuery);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const name = settings?.["podcast_name"] || "Next Step";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-300",
        scrolled
          ? "border-border bg-background/90 backdrop-blur-md shadow-editorial"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="container-editorial flex h-16 items-center justify-between gap-4 md:h-20">
        <Link to="/" className="group flex items-center gap-2" onClick={() => setOpen(false)}>
          <img src={sourceLogo} alt="" className="h-9 w-9 rounded-full border border-border object-cover" />
          <span className="text-display text-lg uppercase md:text-xl">{name}</span>
          <span className="h-2 w-2 rounded-full bg-primary transition-transform group-hover:translate-x-1" />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="relative text-sm font-medium text-foreground/80 transition-colors hover:text-foreground data-[status=active]:text-foreground"
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  <span
                    className={cn(
                      "absolute -bottom-1.5 left-0 h-0.5 bg-primary transition-all duration-300",
                      isActive ? "w-full" : "w-0",
                    )}
                  />
                </>
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link to="/listen">Listen now</Link>
          </Button>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-x-0 top-16 z-40 origin-top border-b border-border bg-background transition-all duration-300 lg:hidden",
          open ? "visible opacity-100" : "pointer-events-none invisible -translate-y-2 opacity-0",
        )}
      >
        <nav aria-label="Mobile" className="container-editorial flex flex-col py-4">
          {NAV.map((item, index) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between border-b border-border/60 py-4 text-display text-2xl uppercase"
            >
              {item.label}
              <span className="text-xs text-primary">{String(index + 1).padStart(2, "0")}</span>
            </Link>
          ))}
          <Button asChild className="mt-5">
            <Link to="/listen" onClick={() => setOpen(false)}>
              Listen now
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}

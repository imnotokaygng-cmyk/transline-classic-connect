import { Link } from "@tanstack/react-router";
import { Menu, Phone, Mail, MapPin, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/book", label: "Book a Ticket" },
  { to: "/parcel", label: "Send a Parcel" },
  { to: "/track-booking", label: "Track Booking" },
  { to: "/track-parcel", label: "Track Parcel" },
  { to: "/routes", label: "Routes" },
  { to: "/contact", label: "Contact" },
] as const;

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary font-display text-lg font-bold text-primary-foreground">
        T
      </span>
      <span className="font-display text-lg font-bold uppercase leading-none tracking-tight">
        Transline
        <span className="block text-[0.65rem] font-semibold tracking-[0.28em] text-muted-foreground">
          CLASSIC
        </span>
      </span>
    </Link>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <Brand />
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeProps={{ className: "text-foreground underline decoration-primary decoration-4 underline-offset-8" }}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            <Button asChild variant="outline" size="sm" className="ml-2">
              <a href={siteConfig.staffPortalUrl} target="_blank" rel="noreferrer">
                Staff Login
              </a>
            </Button>
          </nav>
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open ? (
          <nav className="border-t border-border bg-card px-4 pb-4 lg:hidden">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                activeProps={{ className: "underline decoration-primary decoration-4 underline-offset-8" }}
                className="block border-b border-border/60 py-3 text-base font-medium"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={siteConfig.staffPortalUrl}
              target="_blank"
              rel="noreferrer"
              className="block py-3 text-base font-medium text-muted-foreground"
            >
              Staff Login
            </a>
          </nav>
        ) : null}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-16 border-t border-border bg-secondary">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3">
            <Brand />
            <p className="text-sm text-muted-foreground">
              Safe, reliable and comfortable travel and parcel services across Kenya.
            </p>
          </div>
          <div className="space-y-2 text-sm">
            <h3 className="font-display text-sm font-bold uppercase tracking-wide">Quick links</h3>
            {NAV.slice(1).map((item) => (
              <Link key={item.to} to={item.to} className="block text-muted-foreground hover:text-primary">
                {item.label}
              </Link>
            ))}
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-foreground">
              Contact
            </h3>
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" /> {siteConfig.supportPhone}
            </p>
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" /> {siteConfig.supportEmail}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> {siteConfig.headOffice}
            </p>
          </div>
        </div>
        <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

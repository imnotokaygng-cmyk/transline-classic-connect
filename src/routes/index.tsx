import { createFileRoute, Link } from "@tanstack/react-router";
import { Bus, Package, MapPin, PhoneCall, ShieldCheck, Clock3, Ticket } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { siteConfig, whatsappLink } from "@/config/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Transline Classic | Book Bus Tickets & Send Parcels Online" },
      {
        name: "description",
        content:
          "Book bus tickets online with live seat availability, pay by M-PESA, and send parcels across Kenya with Transline Classic.",
      },
      { property: "og:title", content: "Transline Classic | Book Bus Tickets & Send Parcels Online" },
      {
        property: "og:description",
        content: "Live seat availability, instant M-PESA payment and reliable parcel delivery.",
      },
    ],
  }),
  component: Index,
});

const QUICK_ACTIONS = [
  {
    to: "/book" as const,
    icon: Ticket,
    title: "Book a Ticket",
    description: "Pick your route, choose your seat and pay instantly with M-PESA.",
  },
  {
    to: "/parcel" as const,
    icon: Package,
    title: "Send a Parcel",
    description: "Drop off at any branch or arrange delivery across our network.",
  },
  {
    to: "/track-booking" as const,
    icon: Bus,
    title: "Track a Booking",
    description: "Look up your ticket using your booking reference.",
  },
  {
    to: "/track-parcel" as const,
    icon: MapPin,
    title: "Track a Parcel",
    description: "Follow your parcel from origin to destination in real time.",
  },
];

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: "Live seat availability",
    description: "The same seat map our branch staff use — no double bookings, ever.",
  },
  {
    icon: Clock3,
    title: "Instant confirmation",
    description: "Pay with M-PESA and get your booking reference immediately.",
  },
  {
    icon: PhoneCall,
    title: "Real support",
    description: "Reach our team by phone or WhatsApp for anything you need.",
  },
];

function Index() {
  return (
    <SiteLayout>
      <section className="border-b border-border bg-secondary/60">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <div className="space-y-6">
            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              {siteConfig.tagline}
            </span>
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Book your seat. Send your parcel. Travel with confidence.
            </h1>
            <p className="max-w-lg text-base text-muted-foreground">
              {siteConfig.name} connects you across Kenya with real-time seat availability,
              secure M-PESA payments, and reliable parcel delivery — all in one place.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12">
                <Link to="/book">
                  <Ticket className="mr-2 h-5 w-5" /> Book a Ticket
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12">
                <Link to="/parcel">
                  <Package className="mr-2 h-5 w-5" /> Send a Parcel
                </Link>
              </Button>
            </div>
          </div>
          <img
            src="/IMG-20260817-WA0019.jpg"
            alt="Transline Classic bus and delivery truck on the highway"
            className="aspect-[4/3] w-full rounded-2xl object-cover shadow-lg"
          />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map((action) => (
            <Link key={action.to} to={action.to} className="group">
              <Card className="h-full transition-colors group-hover:border-primary">
                <CardContent className="flex h-full flex-col gap-3 p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <action.icon className="h-5 w-5" />
                  </span>
                  <p className="font-display text-base font-bold">{action.title}</p>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="grid gap-8 sm:grid-cols-3">
          {TRUST_POINTS.map((point) => (
            <div key={point.title} className="space-y-2 text-center sm:text-left">
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary sm:mx-0">
                <point.icon className="h-5 w-5" />
              </span>
              <p className="font-display text-base font-bold">{point.title}</p>
              <p className="text-sm text-muted-foreground">{point.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-secondary/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-4 py-14 text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight">Need help right now?</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Our team is on hand to help you book, reschedule or track a parcel.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild variant="outline" className="h-11">
              <a href={`tel:${siteConfig.supportPhone.replace(/\s/g, "")}`}>
                <PhoneCall className="mr-2 h-4 w-4" /> {siteConfig.supportPhone}
              </a>
            </Button>
            <Button asChild className="h-11">
              <a
                href={whatsappLink("Hi Transline Classic, I need help with a booking.")}
                target="_blank"
                rel="noreferrer"
              >
                Chat on WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

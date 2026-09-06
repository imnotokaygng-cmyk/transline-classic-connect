import { createFileRoute, Link } from "@tanstack/react-router";
import { Bus, Package, MapPin, PhoneCall, ShieldCheck, Clock3, Ticket } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
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
    description: "Instant seat reservation for all major Kenyan routes.",
  },
  {
    to: "/parcel" as const,
    icon: Package,
    title: "Send a Parcel",
    description: "Door-to-door and station-to-station delivery services.",
  },
  {
    to: "/track-booking" as const,
    icon: Bus,
    title: "Track Booking",
    description: "Verify your trip details and scheduled departure time.",
  },
  {
    to: "/track-parcel" as const,
    icon: MapPin,
    title: "Track Parcel",
    description: "Real-time logistics monitoring for your peace of mind.",
  },
];

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: "Live seat availability",
    description:
      "Pick your favorite window seat or travel with friends by seeing exactly what's left on the bus.",
  },
  {
    icon: Clock3,
    title: "Instant M-PESA confirmation",
    description: "Pay securely via mobile money and receive your booking reference in seconds.",
  },
  {
    icon: PhoneCall,
    title: "Real support agents",
    description: "No bots. Talk to our Kenyan customer care team via phone or WhatsApp.",
  },
];

function Index() {
  return (
    <SiteLayout>
      {/* Full-bleed hero */}
      <section className="relative flex min-h-[88vh] flex-col overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/IMG-20260817-WA0019.jpg"
            alt="Transline Classic bus and delivery truck on the highway"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-grow flex-col justify-center px-4 pb-24 pt-28">
          <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="mb-8 inline-flex -skew-x-10 items-center gap-2 bg-primary px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground">
              <span className="skew-x-10">{siteConfig.tagline}</span>
            </div>
            <h1 className="mb-10 font-display text-6xl uppercase leading-[0.9] tracking-wide text-foreground sm:text-7xl md:text-8xl">
              Book your seat.
              <br />
              <span className="text-primary [text-shadow:2px_2px_0_var(--foreground)]">
                Send your parcel.
              </span>
              <br />
              Travel with confidence.
            </h1>
            <div className="flex flex-wrap gap-5">
              <Link
                to="/book"
                className="inline-flex items-center justify-center bg-foreground px-10 py-5 text-lg font-bold uppercase tracking-tight text-primary shadow-xl transition-all duration-300 hover:bg-primary hover:text-foreground"
              >
                Book a Ticket
              </Link>
              <Link
                to="/parcel"
                className="inline-flex items-center justify-center border-2 border-foreground px-10 py-5 text-lg font-bold uppercase tracking-tight text-foreground transition-all duration-300 hover:bg-foreground hover:text-background"
              >
                Send a Parcel
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick actions — overlapping grid */}
      <section className="relative z-20 mx-auto -mt-12 w-full max-w-6xl px-4 pb-24">
        <div className="grid grid-cols-1 gap-0 border border-border bg-card shadow-2xl sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map((action, i) => (
            <Link
              key={action.to}
              to={action.to}
              className={
                "group border-border p-8 transition-colors hover:bg-background sm:p-10 " +
                (i < QUICK_ACTIONS.length - 1 ? "border-b sm:border-b-0 sm:border-r " : "") +
                (i === 1 ? "lg:border-r" : "")
              }
            >
              <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <action.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-3 font-display text-3xl uppercase tracking-wide">{action.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{action.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust points */}
      <section className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="flex flex-col justify-between gap-12 md:flex-row md:gap-16">
          {TRUST_POINTS.map((point) => (
            <div key={point.title} className="flex-1">
              <h4 className="mb-3 border-l-4 border-primary pl-4 font-display text-2xl uppercase tracking-wide">
                {point.title}
              </h4>
              <p className="pl-5 text-sm text-muted-foreground">{point.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Help CTA band */}
      <section className="mt-16 w-full bg-foreground py-12">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-6 px-4 md:flex-row">
          <div className="flex items-center gap-6 text-center md:text-left">
            <div className="hidden h-12 w-12 items-center justify-center rounded-full bg-background/10 text-primary md:flex">
              <PhoneCall className="h-6 w-6" />
            </div>
            <p className="text-xl font-medium tracking-tight text-background">
              Have a question or need a manual booking?
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <a
              href={`tel:${siteConfig.supportPhone.replace(/\s/g, "")}`}
              className="group flex items-center gap-2"
            >
              <span className="border-b border-transparent text-lg font-bold text-primary transition-all group-hover:border-primary">
                {siteConfig.supportPhone}
              </span>
            </a>
            <a
              href={whatsappLink("Hi Transline Classic, I need help with a booking.")}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-2"
            >
              <span className="border-b border-transparent text-lg font-bold text-primary transition-all group-hover:border-primary">
                WhatsApp Chat
              </span>
            </a>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

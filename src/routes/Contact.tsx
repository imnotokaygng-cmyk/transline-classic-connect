import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, PhoneCall } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { siteConfig, whatsappLink } from "@/config/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us | Transline Classic" },
      { name: "description", content: "Get in touch with Transline Classic for bookings, parcels, or any questions." },
    ],
  }),
  component: ContactPage,
});

const CHANNELS = [
  {
    icon: PhoneCall,
    title: "Call us",
    value: siteConfig.supportPhone,
    href: `tel:${siteConfig.supportPhone.replace(/\s/g, "")}`,
    cta: "Call now",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    value: "Chat with our team",
    href: whatsappLink("Hi Transline Classic, I have a question."),
    cta: "Open WhatsApp",
    external: true,
  },
  {
    icon: Mail,
    title: "Email",
    value: siteConfig.supportEmail,
    href: `mailto:${siteConfig.supportEmail}`,
    cta: "Send an email",
  },
];

function ContactPage() {
  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-2xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">Contact us</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Have a question about a booking, parcel, or route? Reach us through any of these channels.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {CHANNELS.map((c) => (
            <Card key={c.title}>
              <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <c.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-sm font-bold">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.value}</p>
                </div>
                <Button asChild size="sm" variant="outline" className="w-full">
                  <a href={c.href} target={c.external ? "_blank" : undefined} rel={c.external ? "noreferrer" : undefined}>
                    {c.cta}
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6">
          <CardContent className="flex items-start gap-3 py-6">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="font-display text-sm font-bold">Head office</p>
              <p className="text-sm text-muted-foreground">{siteConfig.headOffice}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </SiteLayout>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Package, PhoneCall } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { siteConfig, whatsappLink } from "@/config/site";

export const Route = createFileRoute("/parcel")({
  head: () => ({
    meta: [
      { title: "Send a Parcel | Transline Classic" },
      {
        name: "description",
        content: "Send parcels across Kenya with Transline Classic. Chat with our team on WhatsApp to arrange pickup, pricing and delivery.",
      },
    ],
  }),
  component: ParcelPage,
});

function ParcelPage() {
  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-lg px-4 py-16 text-center">
        <Package className="mx-auto h-14 w-14 text-primary" />
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">Send a parcel</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Chat with our team on WhatsApp to arrange pickup, get a price, and drop off your parcel
          at any Transline Classic branch.
        </p>

        <Card className="mt-8 text-left">
          <CardContent className="space-y-4 py-6">
            <p className="text-sm text-muted-foreground">
              Have these ready to speed things up:
            </p>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              <li>Sender and receiver names & phone numbers</li>
              <li>Origin and destination branches</li>
              <li>What you're sending and its approximate weight</li>
            </ul>
          </CardContent>
        </Card>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="h-12">
            <a
              href={whatsappLink("Hi Transline Classic, I'd like to send a parcel.")}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="mr-2 h-5 w-5" /> Chat on WhatsApp
            </a>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12">
            <a href={`tel:${siteConfig.supportPhone.replace(/\s/g, "")}`}>
              <PhoneCall className="mr-2 h-5 w-5" /> Call us
            </a>
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
      }

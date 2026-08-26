import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Search, Ticket } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { formatKes } from "@/config/site";

export const Route = createFileRoute("/track-booking")({
  head: () => ({
    meta: [
      { title: "Track a Booking | Transline Classic" },
      { name: "description", content: "Look up your Transline Classic bus booking using your reference and phone number." },
    ],
  }),
  component: TrackBookingPage,
});

interface BookingResult {
  booking_ref: string;
  passenger_name: string;
  seat_number: string | null;
  payment_status: string | null;
  mpesa_receipt: string | null;
  origin: string | null;
  destination: string | null;
  departure_time: string;
  fare_amount: number;
}

function TrackBookingPage() {
  const [ref, setRef] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<BookingResult | null>(null);

  const lookup = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("track_booking", {
        _booking_ref: ref,
        _phone: phone,
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) throw new Error("NOT_FOUND");
      return row as BookingResult;
    },
    onSuccess: setResult,
    onError: () => {
      setResult(null);
      toast.error("We could not find a booking with that reference and phone number.");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ref.trim()) return toast.error("Enter your booking reference.");
    if (phone.replace(/\D/g, "").length < 9) return toast.error("Enter the phone number used for booking.");
    lookup.mutate();
  }

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-lg px-4 py-8">
        <div className="flex items-center gap-3">
          <Ticket className="h-7 w-7 text-primary" />
          <h1 className="font-display text-3xl font-bold tracking-tight">Track a booking</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your booking reference and the phone number used to book.
        </p>

        <Card className="mt-6">
          <CardContent className="pt-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label>Booking reference</Label>
                <Input
                  value={ref}
                  onChange={(e) => setRef(e.target.value)}
                  placeholder="e.g. TC-260824-A1B2C"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone number</Label>
                <Input
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0712345678"
                  className="h-11"
                />
              </div>
              <Button type="submit" className="h-11 w-full" disabled={lookup.isPending}>
                {lookup.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching…
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" /> Track booking
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {result ? (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Booking found</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                Reference: <span className="font-semibold">{result.booking_ref}</span>
              </p>
              <p>
                Passenger: <span className="font-semibold">{result.passenger_name}</span>
              </p>
              <p>
                Route:{" "}
                <span className="font-semibold">
                  {result.origin ?? "—"} → {result.destination ?? "—"}
                </span>
              </p>
              <p>
                Departure:{" "}
                <span className="font-semibold">
                  {new Date(result.departure_time).toLocaleString("en-KE")}
                </span>
              </p>
              <p>
                Seat: <span className="font-semibold">{result.seat_number ?? "—"}</span>
              </p>
              <p>
                Fare: <span className="font-semibold">{formatKes(result.fare_amount)}</span>
              </p>
              <p>
                Payment status:{" "}
                <span className="font-semibold capitalize">{result.payment_status ?? "pending"}</span>
              </p>
              {result.mpesa_receipt ? (
                <p>
                  M-PESA receipt: <span className="font-semibold">{result.mpesa_receipt}</span>
                </p>
              ) : null}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </SiteLayout>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Bus, CheckCircle2, Clock, Loader2, Printer } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SeatMap } from "@/components/booking/SeatMap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { branchesQuery, routesQuery, takenSeatsQuery, tripsQuery, type TripWithDetails } from "@/lib/queries";
import { formatKes, siteConfig } from "@/config/site";
import { initiateMpesaPayment, getBookingPaymentStatus } from "@/lib/mpesa.functions";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book a Bus Ticket Online | Transline Classic" },
      {
        name: "description",
        content:
          "Search Transline Classic trips, pick your seat on a real bus seat map and pay with M-PESA. Live seat availability shared with our branch offices.",
      },
      { property: "og:title", content: "Book a Bus Ticket Online | Transline Classic" },
      {
        property: "og:description",
        content: "Live seat availability, instant M-PESA payment and a printable ticket.",
      },
    ],
  }),
  component: BookPage,
});

type Step = "search" | "seat" | "details" | "pay" | "done";

function timeOf(iso: string) {
  return new Date(iso).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });
}
function dateOf(iso: string) {
  return new Date(iso).toLocaleDateString("en-KE", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function BookPage() {
  const queryClient = useQueryClient();
  const [origin, setOrigin] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [searched, setSearched] = useState(false);
  const [trip, setTrip] = useState<TripWithDetails | null>(null);
  const [seat, setSeat] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("search");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [payPhone, setPayPhone] = useState("");
  const [booking, setBooking] = useState<{ id: string; ref: string; fare: number } | null>(null);
  const [paymentState, setPaymentState] = useState<"idle" | "waiting" | "paid" | "unpaid">("idle");
  const [receipt, setReceipt] = useState<string | null>(null);
  const [payNotice, setPayNotice] = useState<string | null>(null);

  const branches = useQuery(branchesQuery);
  const routes = useQuery(routesQuery);
  const trips = useQuery({
    ...tripsQuery({ originBranchId: origin, destination, date }),
    enabled: searched,
  });
  const takenSeats = useQuery({ ...takenSeatsQuery(trip?.id ?? ""), enabled: Boolean(trip) });

  const destinations = useMemo(() => {
    const list = (routes.data ?? []).filter((r) => !origin || r.origin_branch_id === origin);
    return Array.from(new Set(list.map((r) => r.destination))).sort();
  }, [routes.data, origin]);

  const createBooking = useMutation({
    mutationFn: async () => {
      if (!trip || !seat) throw new Error("Please select a seat first.");
      const { data, error } = await supabase.rpc("create_public_booking", {
        _trip_id: trip.id,
        _seat_number: seat,
        _passenger_name: name,
        _passenger_phone: phone,
        _id_number: idNumber || "",
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) throw new Error("BOOKING_FAILED");
      return { id: row.booking_id as string, ref: row.booking_ref as string, fare: Number(row.fare) };
    },
    onSuccess: (result) => {
      setBooking(result);
      setPayPhone(phone);
      setStep("pay");
      void queryClient.invalidateQueries({ queryKey: ["taken-seats", trip?.id] });
    },
    onError: (error: { message?: string }) => {
      const msg = error?.message ?? "";
      if (msg.includes("SEAT_TAKEN")) {
        toast.error("Sorry, this seat has just been booked. Please select another seat.");
        setSeat(null);
        setStep("seat");
        void queryClient.invalidateQueries({ queryKey: ["taken-seats", trip?.id] });
      } else if (msg.includes("TRIP_UNAVAILABLE") || msg.includes("TRIP_NOT_FOUND")) {
        toast.error("This trip is no longer available. Please search again.");
        setStep("search");
      } else {
        toast.error("We could not complete your booking. Please try again.");
      }
    },
  });

  const pay = useMutation({
    mutationFn: async () => {
      if (!booking) throw new Error("No booking");
      return initiateMpesaPayment({ data: { bookingId: booking.id, phone: payPhone } });
    },
    onSuccess: (result) => {
      setPayNotice(result.message);
      if (result.ok && "alreadyPaid" in result && result.alreadyPaid) {
        setPaymentState("paid");
        setStep("done");
        return;
      }
      if (result.ok) {
        setPaymentState("waiting");
        toast.success(result.message);
      } else {
        setPaymentState("unpaid");
        toast.error(result.message);
      }
    },
    onError: () => {
      setPaymentState("unpaid");
      toast.error("We could not start the payment. Please try again.");
    },
  });

  // Poll for the verified Daraja callback result.
  useEffect(() => {
    if (paymentState !== "waiting" || !booking) return;
    let attempts = 0;
    const timer = setInterval(async () => {
      attempts += 1;
      try {
        const result = await getBookingPaymentStatus({ data: { bookingId: booking.id } });
        if (result.status === "paid") {
          setReceipt(result.receipt);
          setPaymentState("paid");
          setStep("done");
          clearInterval(timer);
          return;
        }
      } catch {
        /* keep polling */
      }
      if (attempts >= 40) {
        clearInterval(timer);
        setPaymentState("unpaid");
        setPayNotice(
          "We have not received your M-PESA confirmation yet. Your booking is still pending — you can retry the payment.",
        );
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [paymentState, booking]);

  const availableCount = trip ? trip.capacity - (takenSeats.data?.length ?? 0) : 0;

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">Book a ticket</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live availability shared with all Transline Classic branches.
        </p>

        {step === "search" || step === "seat" ? (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Search trips</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label>From</Label>
                <Select
                  value={origin}
                  onValueChange={(v) => {
                    setOrigin(v);
                    setDestination("");
                  }}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select origin" />
                  </SelectTrigger>
                  <SelectContent>
                    {(branches.data ?? []).map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>To</Label>
                <Select value={destination} onValueChange={setDestination}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {destinations.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="travel-date">Travel date</Label>
                <Input
                  id="travel-date"
                  type="date"
                  className="h-11"
                  value={date}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  className="h-11 w-full"
                  onClick={() => {
                    setSearched(true);
                    setTrip(null);
                    setSeat(null);
                    setStep("search");
                  }}
                >
                  Search trips
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {searched && step === "search" ? (
          <section className="mt-6 space-y-3">
            {trips.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading trips…</p>
            ) : trips.isError ? (
              <p className="text-sm text-destructive">
                We could not load trips right now. Please try again.
              </p>
            ) : (trips.data ?? []).length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  No trips available for this search. Try another date or route.
                </CardContent>
              </Card>
            ) : (
              (trips.data ?? []).map((t) => {
                const available = Math.max(0, t.capacity - t.seats_booked);
                return (
                  <Card key={t.id}>
                    <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <p className="font-display text-lg font-bold">
                          {t.origin} → {t.destination}
                        </p>
                        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" /> {dateOf(t.departure_time)} ·{" "}
                            {timeOf(t.departure_time)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bus className="h-4 w-4" /> {t.bus_plate ?? "Bus"}
                            {t.busModel ? ` · ${t.busModel}` : ""}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t.capacity} seats · {t.seats_booked} booked ·{" "}
                          <span className="font-semibold text-foreground">{available} available</span>
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                        <span className="font-display text-xl font-bold text-primary">
                          {formatKes(t.fare)}
                        </span>
                        <Button
                          disabled={available <= 0}
                          onClick={() => {
                            setTrip(t);
                            setSeat(null);
                            setStep("seat");
                          }}
                        >
                          {available <= 0 ? "Fully booked" : "Select seat"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </section>
        ) : null}

        {step === "seat" && trip ? (
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-base">
                Choose your seat · {trip.origin} → {trip.destination}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setStep("search")}>
                <ArrowLeft className="mr-1 h-4 w-4" /> Back
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                {dateOf(trip.departure_time)} · {timeOf(trip.departure_time)} ·{" "}
                {trip.bus_plate ?? "Bus"} · {availableCount} of {trip.capacity} seats available
              </p>
              {takenSeats.isLoading ? (
                <p className="text-sm text-muted-foreground">Checking live seat availability…</p>
              ) : (
                <SeatMap
                  capacity={trip.capacity}
                  taken={takenSeats.data ?? []}
                  selected={seat}
                  onSelect={setSeat}
                />
              )}
              <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm">
                  <p>
                    Selected seat:{" "}
                    <span className="font-semibold">{seat ?? "None selected"}</span>
                  </p>
                  <p>
                    Fare: <span className="font-semibold">{formatKes(trip.fare)}</span>
                  </p>
                </div>
                <Button className="h-11" disabled={!seat} onClick={() => setStep("details")}>
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {step === "details" && trip ? (
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-base">Passenger details</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setStep("seat")}>
                <ArrowLeft className="mr-1 h-4 w-4" /> Back
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-secondary p-3 text-sm">
                {trip.origin} → {trip.destination} · {dateOf(trip.departure_time)} ·{" "}
                {timeOf(trip.departure_time)} · Seat {seat} · {formatKes(trip.fare)}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full name</Label>
                  <Input
                    id="full-name"
                    className="h-11"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input
                    id="phone"
                    className="h-11"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0712345678"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="id-number">ID / Passport number (optional)</Label>
                  <Input
                    id="id-number"
                    className="h-11"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                  />
                </div>
              </div>
              <Button
                className="h-11 w-full sm:w-auto"
                disabled={createBooking.isPending}
                onClick={() => {
                  if (name.trim().length < 3) {
                    toast.error("Please enter the passenger's full name.");
                    return;
                  }
                  if (phone.replace(/\D/g, "").length < 9) {
                    toast.error("Please enter a valid phone number, e.g. 0712345678.");
                    return;
                  }
                  createBooking.mutate();
                }}
              >
                {createBooking.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Reserving seat…
                  </>
                ) : (
                  "Reserve seat & continue to payment"
                )}
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {step === "pay" && booking && trip ? (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Pay with M-PESA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-secondary p-3 text-sm">
                <p>
                  Booking reference: <span className="font-semibold">{booking.ref}</span>
                </p>
                <p>
                  Seat {seat} · {trip.origin} → {trip.destination} · Amount{" "}
                  <span className="font-semibold">{formatKes(booking.fare)}</span>
                </p>
                <p className="text-muted-foreground">Status: pending payment</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pay-phone">M-PESA phone number</Label>
                <Input
                  id="pay-phone"
                  className="h-11"
                  inputMode="tel"
                  value={payPhone}
                  onChange={(e) => setPayPhone(e.target.value)}
                  placeholder="0712345678"
                />
              </div>
              {payNotice ? <p className="text-sm text-muted-foreground">{payNotice}</p> : null}
              <div className="flex flex-wrap gap-3">
                <Button
                  className="h-11"
                  disabled={pay.isPending || paymentState === "waiting"}
                  onClick={() => pay.mutate()}
                >
                  {pay.isPending || paymentState === "waiting" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {paymentState === "waiting" ? "Waiting for confirmation…" : "Sending prompt…"}
                    </>
                  ) : (
                    "Pay with M-PESA"
                  )}
                </Button>
                <Button variant="outline" className="h-11" asChild>
                  <Link to="/track-booking">Pay later / Track booking</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {step === "done" && booking && trip ? (
          <Card className="mt-6 print:border-0 print:shadow-none">
            <CardContent className="space-y-4 py-8">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-primary" />
                <h2 className="font-display text-2xl font-bold">Booking confirmed</h2>
              </div>
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <Detail label="Booking reference" value={booking.ref} />
                <Detail label="Passenger" value={name} />
                <Detail label="Origin" value={trip.origin} />
                <Detail label="Destination" value={trip.destination} />
                <Detail label="Travel date" value={dateOf(trip.departure_time)} />
                <Detail label="Departure time" value={timeOf(trip.departure_time)} />
                <Detail label="Bus" value={`${trip.bus_plate ?? "—"}${trip.busModel ? ` · ${trip.busModel}` : ""}`} />
                <Detail label="Seat" value={seat ?? "—"} />
                <Detail label="Amount paid" value={formatKes(booking.fare)} />
                <Detail label="M-PESA reference" value={receipt ?? "—"} />
              </dl>
              <p className="text-sm text-muted-foreground">
                Please arrive at the {trip.origin} office at least 20 minutes before departure. For
                help call {siteConfig.supportPhone}.
              </p>
              <div className="flex flex-wrap gap-3 print:hidden">
                <Button className="h-11" onClick={() => window.print()}>
                  <Printer className="mr-2 h-4 w-4" /> Print ticket
                </Button>
                <Button variant="outline" className="h-11" asChild>
                  <Link to="/track-booking">Track booking</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </SiteLayout>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border p-3">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

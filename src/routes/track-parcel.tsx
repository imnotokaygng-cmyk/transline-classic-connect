import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Search, MapPin } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { formatKes } from "@/config/site";

export const Route = createFileRoute("/track-parcel")({
  head: () => ({
    meta: [
      { title: "Track a Parcel | Transline Classic" },
      { name: "description", content: "Track your Transline Classic parcel using your tracking code and access password." },
    ],
  }),
  component: TrackParcelPage,
});

interface ParcelResult {
  tracking_code: string;
  status: string | null;
  sender_name: string;
  receiver_name: string;
  receiver_phone: string;
  origin: string | null;
  destination: string | null;
  weight_kg: number | null;
  fare_amount: number;
  payment_status: string | null;
  created_at: string;
}

function TrackParcelPage() {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<ParcelResult | null>(null);

  const lookup = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("track_public_parcel", {
        _tracking_code: code,
        _access_password: password,
      });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      if (!row) throw new Error("NOT_FOUND");
      return row as ParcelResult;
    },
    onSuccess: setResult,
    onError: () => {
      setResult(null);
      toast.error("We could not find a parcel with that tracking code and password.");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return toast.error("Enter your tracking code.");
    if (!password.trim()) return toast.error("Enter your access password.");
    lookup.mutate();
  }

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-lg px-4 py-8">
        <div className="flex items-center gap-3">
          <MapPin className="h-7 w-7 text-primary" />
          <h1 className="font-display text-3xl font-bold tracking-tight">Track a parcel</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the tracking code and access password given to you at drop-off.
        </p>

        <Card className="mt-6">
          <CardContent className="pt-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label>Tracking code</Label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. TCP-260824-A1B2C"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label>Access password</Label>
                <Input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6-character password"
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
                    <Search className="mr-2 h-4 w-4" /> Track parcel
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {result ? (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Parcel found</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                Tracking code: <span className="font-semibold">{result.tracking_code}</span>
              </p>
              <p>
                Status: <span className="font-semibold capitalize">{result.status ?? "pending"}</span>
              </p>
              <p>
                Route:{" "}
                <span className="font-semibold">
                  {result.origin ?? "—"} → {result.destination ?? "—"}
                </span>
              </p>
              <p>
                Sender: <span className="font-semibold">{result.sender_name}</span>
              </p>
              <p>
                Receiver:{" "}
                <span className="font-semibold">
                  {result.receiver_name} ({result.receiver_phone})
                </span>
              </p>
              {result.weight_kg ? (
                <p>
                  Weight: <span className="font-semibold">{result.weight_kg}kg</span>
                </p>
              ) : null}
              <p>
                Fare: <span className="font-semibold">{formatKes(result.fare_amount)}</span>
              </p>
              <p>
                Payment status:{" "}
                <span className="font-semibold capitalize">{result.payment_status ?? "pending"}</span>
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </SiteLayout>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin, ArrowRight, Ticket } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { branchesQuery, routesQuery } from "@/lib/queries";
import { formatKes } from "@/config/site";

export const Route = createFileRoute("/routes")({
  head: () => ({
    meta: [
      { title: "Our Routes | Transline Classic" },
      { name: "description", content: "See all Transline Classic routes and fares across Kenya." },
    ],
  }),
  component: RoutesPage,
});

function RoutesPage() {
  const branches = useQuery(branchesQuery);
  const routes = useQuery(routesQuery);

  const branchById = new Map((branches.data ?? []).map((b) => [b.id, b]));

  return (
    <SiteLayout>
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <div className="flex items-center gap-3">
          <MapPin className="h-7 w-7 text-primary" />
          <h1 className="font-display text-3xl font-bold tracking-tight">Our routes</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Transline Classic connects these towns. Fares shown are base fares — book online to see
          live seat availability.
        </p>

        <div className="mt-6 space-y-3">
          {routes.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading routes…</p>
          ) : (routes.data ?? []).length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                Route information is not available right now.
              </CardContent>
            </Card>
          ) : (
            (routes.data ?? []).map((r) => {
              const origin = r.origin_branch_id ? branchById.get(r.origin_branch_id) : undefined;
              return (
                <Card key={r.id}>
                  <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-base font-bold">
                        {origin?.name ?? "—"}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="font-display text-base font-bold">{r.destination}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <span className="font-display text-lg font-bold text-primary">
                        {formatKes(r.base_fare)}
                      </span>
                      <Button asChild size="sm">
                        <Link to="/book">
                          <Ticket className="mr-2 h-4 w-4" /> Book
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </SiteLayout>
  );
}

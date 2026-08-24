import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Branch {
  id: string;
  name: string;
  town: string | null;
  phone: string | null;
}

export interface RouteRow {
  id: string;
  origin_branch_id: string | null;
  destination: string;
  base_fare: number;
}

export interface TripRow {
  id: string;
  route_id: string | null;
  branch_id: string;
  bus_plate: string | null;
  departure_time: string;
  total_seats: number;
  seats_booked: number;
  status: string | null;
}

export interface TripWithDetails extends TripRow {
  origin: string;
  destination: string;
  fare: number;
  busModel: string | null;
  capacity: number;
}

function fail(message: string, error: unknown): never {
  console.error(message, error);
  throw new Error(message);
}

export const branchesQuery = queryOptions({
  queryKey: ["branches"],
  queryFn: async (): Promise<Branch[]> => {
    const { data, error } = await supabase
      .from("branches")
      .select("id,name,town,phone")
      .order("name");
    if (error) fail("We could not load our branches. Please try again.", error);
    return data ?? [];
  },
});

export const routesQuery = queryOptions({
  queryKey: ["routes"],
  queryFn: async (): Promise<RouteRow[]> => {
    const { data, error } = await supabase
      .from("routes")
      .select("id,origin_branch_id,destination,base_fare")
      .order("destination");
    if (error) fail("We could not load our routes. Please try again.", error);
    return (data ?? []).map((r) => ({ ...r, base_fare: Number(r.base_fare) }));
  },
});

async function loadBuses() {
  const { data, error } = await supabase.from("buses").select("plate_number,model,capacity");
  if (error) {
    console.error(error);
    return [];
  }
  return data ?? [];
}

export async function fetchTrips(params: {
  originBranchId?: string;
  destination?: string;
  date?: string;
}): Promise<TripWithDetails[]> {
  const [{ data: trips, error }, branches, routes, buses] = await Promise.all([
    supabase
      .from("trips")
      .select("id,route_id,branch_id,bus_plate,departure_time,total_seats,seats_booked,status")
      .eq("status", "scheduled")
      .gt("departure_time", new Date().toISOString())
      .order("departure_time"),
    supabase.from("branches").select("id,name,town"),
    supabase.from("routes").select("id,origin_branch_id,destination,base_fare"),
    loadBuses(),
  ]);
  if (error) fail("We could not load available trips right now. Please try again.", error);

  const branchById = new Map((branches.data ?? []).map((b) => [b.id, b]));
  const routeById = new Map((routes.data ?? []).map((r) => [r.id, r]));
  const busByPlate = new Map(buses.map((b) => [b.plate_number, b]));

  let result: TripWithDetails[] = (trips ?? []).map((t) => {
    const route = t.route_id ? routeById.get(t.route_id) : undefined;
    const branch = branchById.get(route?.origin_branch_id ?? t.branch_id);
    const bus = t.bus_plate ? busByPlate.get(t.bus_plate) : undefined;
    return {
      ...t,
      origin: branch?.name ?? "—",
      destination: route?.destination ?? "—",
      fare: Number(route?.base_fare ?? 0),
      busModel: bus?.model ?? null,
      capacity: bus?.capacity ?? t.total_seats,
    };
  });

  if (params.originBranchId) {
    result = result.filter((t) => {
      const route = t.route_id ? routeById.get(t.route_id) : undefined;
      return (route?.origin_branch_id ?? t.branch_id) === params.originBranchId;
    });
  }
  if (params.destination) {
    result = result.filter((t) => t.destination === params.destination);
  }
  if (params.date) {
    result = result.filter((t) => t.departure_time.slice(0, 10) === params.date);
  }
  return result;
}

export function tripsQuery(params: { originBranchId?: string; destination?: string; date?: string }) {
  return queryOptions({
    queryKey: ["trips", params],
    queryFn: () => fetchTrips(params),
  });
}

export const upcomingTripsQuery = queryOptions({
  queryKey: ["trips", "all-upcoming"],
  queryFn: () => fetchTrips({}),
});

export function takenSeatsQuery(tripId: string) {
  return queryOptions({
    queryKey: ["taken-seats", tripId],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase.rpc("get_taken_seats", { _trip_id: tripId });
      if (error) fail("We could not check seat availability. Please try again.", error);
      return (data ?? []).map((row: { seat_number: string }) => row.seat_number);
    },
    refetchInterval: 15000,
  });
}

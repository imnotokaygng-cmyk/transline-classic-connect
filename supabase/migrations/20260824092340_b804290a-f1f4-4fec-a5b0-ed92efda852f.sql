
-- Public read of bus info (non-sensitive)
CREATE POLICY buses_public_read ON public.buses FOR SELECT TO anon USING (true);
GRANT SELECT ON public.buses TO anon;

-- Prevent double-selling a seat on a trip (staff or online)
CREATE UNIQUE INDEX IF NOT EXISTS bookings_trip_seat_unique
  ON public.bookings (trip_id, seat_number)
  WHERE seat_number IS NOT NULL AND payment_status IS DISTINCT FROM 'cancelled';

-- Secure public booking creation (bypasses RLS, enforces its own rules)
CREATE OR REPLACE FUNCTION public.create_public_booking(
  _trip_id uuid,
  _seat_number text,
  _passenger_name text,
  _passenger_phone text,
  _id_number text DEFAULT NULL
)
RETURNS TABLE(booking_id uuid, booking_ref text, fare numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_trip public.trips%ROWTYPE;
  v_fare numeric;
  v_ref text;
  v_id uuid;
BEGIN
  IF _seat_number IS NULL OR btrim(_seat_number) = '' THEN
    RAISE EXCEPTION 'SEAT_REQUIRED';
  END IF;
  IF _passenger_name IS NULL OR btrim(_passenger_name) = '' THEN
    RAISE EXCEPTION 'NAME_REQUIRED';
  END IF;
  IF _passenger_phone IS NULL OR btrim(_passenger_phone) = '' THEN
    RAISE EXCEPTION 'PHONE_REQUIRED';
  END IF;

  SELECT * INTO v_trip FROM public.trips WHERE id = _trip_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'TRIP_NOT_FOUND'; END IF;
  IF v_trip.status IS DISTINCT FROM 'scheduled' OR v_trip.departure_time <= now() THEN
    RAISE EXCEPTION 'TRIP_UNAVAILABLE';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.get_taken_seats(_trip_id) t WHERE t.seat_number = _seat_number
  ) THEN
    RAISE EXCEPTION 'SEAT_TAKEN';
  END IF;

  SELECT r.base_fare INTO v_fare FROM public.routes r WHERE r.id = v_trip.route_id;
  v_fare := COALESCE(v_fare, 0);
  v_ref := 'TC-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text,'-',''), 1, 5));

  INSERT INTO public.bookings (trip_id, branch_id, passenger_name, passenger_phone, seat_number, fare_amount, payment_status, booking_ref)
  VALUES (_trip_id, v_trip.branch_id, btrim(_passenger_name), btrim(_passenger_phone), _seat_number, v_fare, 'pending', v_ref)
  RETURNING id INTO v_id;

  INSERT INTO public.passengers (booking_id, full_name, phone, id_number, seat_number)
  VALUES (v_id, btrim(_passenger_name), btrim(_passenger_phone), NULLIF(btrim(COALESCE(_id_number,'')),''), _seat_number);

  RETURN QUERY SELECT v_id, v_ref, v_fare;
EXCEPTION WHEN unique_violation THEN
  RAISE EXCEPTION 'SEAT_TAKEN';
END;
$$;

-- Secure booking lookup: requires reference AND matching phone
CREATE OR REPLACE FUNCTION public.track_booking(_booking_ref text, _phone text)
RETURNS TABLE(
  booking_ref text, passenger_name text, seat_number text, fare_amount numeric,
  payment_status text, mpesa_receipt text, departure_time timestamptz,
  bus_plate text, origin text, destination text, created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.booking_ref, b.passenger_name, b.seat_number, b.fare_amount,
         b.payment_status, b.mpesa_receipt, t.departure_time, t.bus_plate,
         br.name, r.destination, b.created_at
  FROM public.bookings b
  JOIN public.trips t ON t.id = b.trip_id
  LEFT JOIN public.routes r ON r.id = t.route_id
  LEFT JOIN public.branches br ON br.id = t.branch_id
  WHERE upper(b.booking_ref) = upper(btrim(_booking_ref))
    AND right(regexp_replace(b.passenger_phone, '\D', '', 'g'), 9)
        = right(regexp_replace(_phone, '\D', '', 'g'), 9)
  LIMIT 1;
$$;

-- Secure parcel lookup: tracking code AND access password
CREATE OR REPLACE FUNCTION public.track_parcel(_tracking_code text, _access_password text)
RETURNS TABLE(
  tracking_code text, origin text, destination text, status text,
  payment_status text, created_at timestamptz, updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.tracking_code, ob.name, db.name, p.status, p.payment_status, p.created_at, p.updated_at
  FROM public.parcels p
  LEFT JOIN public.branches ob ON ob.id = p.origin_branch_id
  LEFT JOIN public.branches db ON db.id = p.destination_branch_id
  WHERE upper(p.tracking_code) = upper(btrim(_tracking_code))
    AND p.access_password = btrim(_access_password)
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.create_public_booking(uuid, text, text, text, text) FROM public;
REVOKE ALL ON FUNCTION public.track_booking(text, text) FROM public;
REVOKE ALL ON FUNCTION public.track_parcel(text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.create_public_booking(uuid, text, text, text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.track_booking(text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.track_parcel(text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_taken_seats(uuid) TO anon;

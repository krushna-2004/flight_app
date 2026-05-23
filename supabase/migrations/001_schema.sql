-- =============================================================
-- Migration 001: Core schema
-- =============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------
-- FLIGHTS
-- ---------------------------------------------------------------
CREATE TABLE public.flights (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flight_no     TEXT NOT NULL UNIQUE,
  origin        TEXT NOT NULL,
  destination   TEXT NOT NULL,
  departs_at    TIMESTAMPTZ NOT NULL,
  arrives_at    TIMESTAMPTZ NOT NULL,
  aircraft_type TEXT NOT NULL DEFAULT 'Boeing 737',
  status        TEXT NOT NULL DEFAULT 'scheduled'
                CHECK (status IN ('scheduled','delayed','cancelled','completed')),
  base_price    NUMERIC(10,2) NOT NULL CHECK (base_price > 0)
);

ALTER TABLE public.flights ENABLE ROW LEVEL SECURITY;

-- Flights are public-readable
CREATE POLICY "flights_select_all" ON public.flights
  FOR SELECT USING (true);

-- ---------------------------------------------------------------
-- SEATS
-- ---------------------------------------------------------------
CREATE TABLE public.seats (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  flight_id    UUID NOT NULL REFERENCES public.flights(id) ON DELETE CASCADE,
  seat_number  TEXT NOT NULL,
  class        TEXT NOT NULL CHECK (class IN ('economy','business','first')),
  is_available BOOLEAN NOT NULL DEFAULT true,
  extra_fee    NUMERIC(10,2) NOT NULL DEFAULT 0,
  UNIQUE (flight_id, seat_number)
);

ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;

-- Seats are public-readable
CREATE POLICY "seats_select_all" ON public.seats
  FOR SELECT USING (true);

-- ---------------------------------------------------------------
-- BOOKINGS
-- ---------------------------------------------------------------
CREATE TABLE public.bookings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flight_id   UUID NOT NULL REFERENCES public.flights(id),
  seat_id     UUID NOT NULL REFERENCES public.seats(id),
  status      TEXT NOT NULL DEFAULT 'confirmed'
              CHECK (status IN ('confirmed','rescheduled','cancelled')),
  booked_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_price NUMERIC(10,2) NOT NULL,
  pnr_code    TEXT NOT NULL UNIQUE DEFAULT UPPER(SUBSTRING(uuid_generate_v4()::TEXT, 1, 6))
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bookings_select_own" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "bookings_insert_own" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bookings_update_own" ON public.bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- ---------------------------------------------------------------
-- PASSENGERS
-- ---------------------------------------------------------------
CREATE TABLE public.passengers (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id   UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  full_name    TEXT NOT NULL,
  passport_no  TEXT NOT NULL,
  nationality  TEXT NOT NULL,
  dob          DATE NOT NULL
);

ALTER TABLE public.passengers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "passengers_select_own" ON public.passengers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = passengers.booking_id AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "passengers_insert_own" ON public.passengers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = passengers.booking_id AND b.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------
-- RESCHEDULES
-- ---------------------------------------------------------------
CREATE TABLE public.reschedules (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id    UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  old_flight_id UUID NOT NULL REFERENCES public.flights(id),
  new_flight_id UUID NOT NULL REFERENCES public.flights(id),
  requested_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fee_charged   NUMERIC(10,2) NOT NULL DEFAULT 0
);

ALTER TABLE public.reschedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reschedules_select_own" ON public.reschedules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = reschedules.booking_id AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "reschedules_insert_own" ON public.reschedules
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = reschedules.booking_id AND b.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------
-- DB-LEVEL TRIGGER: Block cancellations within 2 hours of departure
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_late_cancellation()
RETURNS TRIGGER AS $$
DECLARE
  departs TIMESTAMPTZ;
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    SELECT departs_at INTO departs
    FROM public.flights
    WHERE id = NEW.flight_id;

    IF departs - NOW() < INTERVAL '2 hours' THEN
      RAISE EXCEPTION 'Cancellations are not allowed within 2 hours of departure';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_prevent_late_cancellation
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.prevent_late_cancellation();

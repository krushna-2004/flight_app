-- =============================================================
-- Migration 003: Seed data — 8 flights across 4 routes
-- =============================================================

-- ---------------------------------------------------------------
-- Flights
-- ---------------------------------------------------------------
INSERT INTO public.flights (id, flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price) VALUES
  ('11111111-0000-0000-0000-000000000001', 'SK101', 'Mumbai',    'Delhi',     NOW() + INTERVAL '2 days 6 hours',  NOW() + INTERVAL '2 days 8 hours',  'Airbus A320', 'scheduled', 4500),
  ('11111111-0000-0000-0000-000000000002', 'SK102', 'Mumbai',    'Delhi',     NOW() + INTERVAL '3 days 14 hours', NOW() + INTERVAL '3 days 16 hours', 'Boeing 737',  'scheduled', 5200),
  ('11111111-0000-0000-0000-000000000003', 'SK201', 'Delhi',     'Bangalore', NOW() + INTERVAL '4 days 8 hours',  NOW() + INTERVAL '4 days 11 hours', 'Airbus A321', 'scheduled', 6800),
  ('11111111-0000-0000-0000-000000000004', 'SK202', 'Delhi',     'Bangalore', NOW() + INTERVAL '5 days 18 hours', NOW() + INTERVAL '5 days 21 hours', 'Boeing 737',  'scheduled', 7500),
  ('11111111-0000-0000-0000-000000000005', 'SK301', 'Bangalore', 'Chennai',   NOW() + INTERVAL '2 days 7 hours',  NOW() + INTERVAL '2 days 8 hours',  'ATR 72',      'scheduled', 2800),
  ('11111111-0000-0000-0000-000000000006', 'SK302', 'Bangalore', 'Chennai',   NOW() + INTERVAL '6 days 10 hours', NOW() + INTERVAL '6 days 11 hours', 'Airbus A320', 'scheduled', 3100),
  ('11111111-0000-0000-0000-000000000007', 'SK401', 'Mumbai',    'Kolkata',   NOW() + INTERVAL '3 days 5 hours',  NOW() + INTERVAL '3 days 7 hours 30 minutes', 'Boeing 777', 'scheduled', 8900),
  ('11111111-0000-0000-0000-000000000008', 'SK402', 'Mumbai',    'Kolkata',   NOW() + INTERVAL '7 days 15 hours', NOW() + INTERVAL '7 days 17 hours 30 minutes', 'Airbus A350', 'scheduled', 9500);

-- ---------------------------------------------------------------
-- Helper function to generate seats for a flight
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION seed_seats_for_flight(p_flight_id UUID)
RETURNS VOID AS $$
DECLARE
  r INT; c TEXT;
  seat_num TEXT;
  seat_class TEXT;
  seat_fee NUMERIC;
BEGIN
  -- First class: rows 1-3, columns A-D
  FOREACH r IN ARRAY ARRAY[1,2,3] LOOP
    FOREACH c IN ARRAY ARRAY['A','B','C','D'] LOOP
      seat_num := r::TEXT || c;
      INSERT INTO public.seats (flight_id, seat_number, class, is_available, extra_fee)
      VALUES (p_flight_id, seat_num, 'first', true, 15000)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;

  -- Business class: rows 4-8, columns A-F
  FOR r IN 4..8 LOOP
    FOREACH c IN ARRAY ARRAY['A','B','C','D','E','F'] LOOP
      seat_num := r::TEXT || c;
      INSERT INTO public.seats (flight_id, seat_number, class, is_available, extra_fee)
      VALUES (p_flight_id, seat_num, 'business', true, 5000)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;

  -- Economy class: rows 9-30, columns A-F
  FOR r IN 9..30 LOOP
    FOREACH c IN ARRAY ARRAY['A','B','C','D','E','F'] LOOP
      seat_num := r::TEXT || c;
      INSERT INTO public.seats (flight_id, seat_number, class, is_available, extra_fee)
      VALUES (p_flight_id, seat_num, 'economy', true, 0)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Generate seats for all flights
SELECT seed_seats_for_flight('11111111-0000-0000-0000-000000000001');
SELECT seed_seats_for_flight('11111111-0000-0000-0000-000000000002');
SELECT seed_seats_for_flight('11111111-0000-0000-0000-000000000003');
SELECT seed_seats_for_flight('11111111-0000-0000-0000-000000000004');
SELECT seed_seats_for_flight('11111111-0000-0000-0000-000000000005');
SELECT seed_seats_for_flight('11111111-0000-0000-0000-000000000006');
SELECT seed_seats_for_flight('11111111-0000-0000-0000-000000000007');
SELECT seed_seats_for_flight('11111111-0000-0000-0000-000000000008');

DROP FUNCTION seed_seats_for_flight;

-- ---------------------------------------------------------------
-- Test user (created via Supabase Auth — see README)
-- credentials: test@skybook.dev / Test@12345
-- ---------------------------------------------------------------

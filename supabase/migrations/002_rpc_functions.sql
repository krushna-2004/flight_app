-- =============================================================
-- Migration 002: RPC functions
-- =============================================================

-- ---------------------------------------------------------------
-- RPC: reserve_seat
-- Atomically checks availability and creates booking + passenger
-- Prevents double-booking race conditions via FOR UPDATE SKIP LOCKED
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.reserve_seat(
  p_user_id     UUID,
  p_flight_id   UUID,
  p_seat_id     UUID,
  p_total_price NUMERIC,
  p_full_name   TEXT,
  p_passport_no TEXT,
  p_nationality TEXT,
  p_dob         DATE
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_seat        public.seats;
  v_booking_id  UUID;
  v_pnr         TEXT;
BEGIN
  -- Lock the seat row to prevent concurrent reservations
  SELECT * INTO v_seat
  FROM public.seats
  WHERE id = p_seat_id AND flight_id = p_flight_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Seat not found';
  END IF;

  IF NOT v_seat.is_available THEN
    RAISE EXCEPTION 'Seat is no longer available';
  END IF;

  -- Generate PNR
  v_pnr := UPPER(SUBSTRING(encode(gen_random_bytes(4), 'hex'), 1, 6));

  -- Create booking
  INSERT INTO public.bookings (user_id, flight_id, seat_id, total_price, pnr_code)
  VALUES (p_user_id, p_flight_id, p_seat_id, p_total_price, v_pnr)
  RETURNING id INTO v_booking_id;

  -- Create passenger record
  INSERT INTO public.passengers (booking_id, full_name, passport_no, nationality, dob)
  VALUES (v_booking_id, p_full_name, p_passport_no, p_nationality, p_dob);

  -- Mark seat as unavailable
  UPDATE public.seats SET is_available = false WHERE id = p_seat_id;

  RETURN json_build_object(
    'booking_id', v_booking_id,
    'pnr_code', v_pnr
  );
END;
$$;

-- ---------------------------------------------------------------
-- RPC: cancel_booking
-- Atomically cancels booking and frees the seat
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cancel_booking(p_booking_id UUID, p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking public.bookings;
  departs   TIMESTAMPTZ;
BEGIN
  SELECT * INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  IF v_booking.status = 'cancelled' THEN
    RAISE EXCEPTION 'Booking is already cancelled';
  END IF;

  SELECT departs_at INTO departs FROM public.flights WHERE id = v_booking.flight_id;

  IF departs - NOW() < INTERVAL '2 hours' THEN
    RAISE EXCEPTION 'Cancellations are not allowed within 2 hours of departure';
  END IF;

  UPDATE public.bookings SET status = 'cancelled' WHERE id = p_booking_id;
  UPDATE public.seats SET is_available = true WHERE id = v_booking.seat_id;

  RETURN json_build_object('success', true, 'booking_id', p_booking_id);
END;
$$;

-- ---------------------------------------------------------------
-- RPC: reschedule_booking
-- Moves booking to a new flight, charges fee if more expensive
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.reschedule_booking(
  p_booking_id     UUID,
  p_user_id        UUID,
  p_new_flight_id  UUID,
  p_new_seat_id    UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking      public.bookings;
  v_old_flight   public.flights;
  v_new_flight   public.flights;
  v_new_seat     public.seats;
  v_fee          NUMERIC := 0;
  v_price_diff   NUMERIC;
BEGIN
  SELECT * INTO v_booking FROM public.bookings
  WHERE id = p_booking_id AND user_id = p_user_id FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'Booking not found'; END IF;
  IF v_booking.status = 'cancelled' THEN RAISE EXCEPTION 'Cannot reschedule a cancelled booking'; END IF;

  SELECT * INTO v_old_flight FROM public.flights WHERE id = v_booking.flight_id;
  SELECT * INTO v_new_flight FROM public.flights WHERE id = p_new_flight_id;
  SELECT * INTO v_new_seat   FROM public.seats   WHERE id = p_new_seat_id FOR UPDATE;

  IF NOT v_new_seat.is_available THEN
    RAISE EXCEPTION 'New seat is not available';
  END IF;

  v_price_diff := v_new_flight.base_price - v_old_flight.base_price;
  IF v_price_diff > 0 THEN v_fee := v_price_diff; END IF;

  -- Free old seat
  UPDATE public.seats SET is_available = true WHERE id = v_booking.seat_id;
  -- Take new seat
  UPDATE public.seats SET is_available = false WHERE id = p_new_seat_id;

  -- Log reschedule
  INSERT INTO public.reschedules (booking_id, old_flight_id, new_flight_id, fee_charged)
  VALUES (p_booking_id, v_booking.flight_id, p_new_flight_id, v_fee);

  -- Update booking
  UPDATE public.bookings
  SET flight_id   = p_new_flight_id,
      seat_id     = p_new_seat_id,
      status      = 'rescheduled',
      total_price = v_booking.total_price + v_fee
  WHERE id = p_booking_id;

  RETURN json_build_object('success', true, 'fee_charged', v_fee);
END;
$$;

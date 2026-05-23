-- =============================================================
-- Migration 004: Enable Supabase Realtime on seats table
-- =============================================================

-- Add seats table to the realtime publication
-- (Supabase creates supabase_realtime publication by default)
ALTER PUBLICATION supabase_realtime ADD TABLE public.seats;

-- Also add bookings so My Bookings can refresh in realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;

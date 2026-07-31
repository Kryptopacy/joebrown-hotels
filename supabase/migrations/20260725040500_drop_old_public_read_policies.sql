-- Drop leftover overly permissive policies that were missed in previous migrations
DROP POLICY IF EXISTS "Allow public read on guests" ON public.guests;
DROP POLICY IF EXISTS "Allow public read on service_requests" ON public.service_requests;
DROP POLICY IF EXISTS "Allow public read on bookings" ON public.bookings;

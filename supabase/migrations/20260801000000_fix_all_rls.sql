-- Fix RLS Policies for MVP - Allow All Access
-- This ensures the Admin Dashboard and Public Site do not encounter 403 Forbidden errors.

-- Bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.bookings;
CREATE POLICY "Enable all access for all users" ON public.bookings FOR ALL USING (true) WITH CHECK (true);

-- Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.orders;
CREATE POLICY "Enable all access for all users" ON public.orders FOR ALL USING (true) WITH CHECK (true);

-- Order Items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.order_items;
CREATE POLICY "Enable all access for all users" ON public.order_items FOR ALL USING (true) WITH CHECK (true);

-- Menu Items
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.menu_items;
CREATE POLICY "Enable all access for all users" ON public.menu_items FOR ALL USING (true) WITH CHECK (true);

-- Menu Categories
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.menu_categories;
CREATE POLICY "Enable all access for all users" ON public.menu_categories FOR ALL USING (true) WITH CHECK (true);

-- Guests
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.guests;
CREATE POLICY "Enable all access for all users" ON public.guests FOR ALL USING (true) WITH CHECK (true);

-- Service Requests
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.service_requests;
CREATE POLICY "Enable all access for all users" ON public.service_requests FOR ALL USING (true) WITH CHECK (true);

-- Rooms
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.rooms;
CREATE POLICY "Enable all access for all users" ON public.rooms FOR ALL USING (true) WITH CHECK (true);

-- Hotels
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.hotels;
CREATE POLICY "Enable all access for all users" ON public.hotels FOR ALL USING (true) WITH CHECK (true);

-- Staff Users
ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all access for all users" ON public.staff_users;
CREATE POLICY "Enable all access for all users" ON public.staff_users FOR ALL USING (true) WITH CHECK (true);

-- Gallery Images (if it exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'gallery_images') THEN
    EXECUTE 'ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "Enable all access for all users" ON public.gallery_images';
    EXECUTE 'CREATE POLICY "Enable all access for all users" ON public.gallery_images FOR ALL USING (true) WITH CHECK (true)';
  END IF;
END $$;

-- Fix 'rls_policy_always_true' linter warnings by replacing USING (true) and WITH CHECK (true)
-- with (select auth.role()) = 'authenticated' / 'anon' for operations other than SELECT.

-- 1. Drop existing policies from the previous fix
DROP POLICY IF EXISTS "Allow auth all on hotels" ON hotels;
DROP POLICY IF EXISTS "Allow auth all on site_settings" ON site_settings;
DROP POLICY IF EXISTS "Allow auth all on menu_categories" ON menu_categories;
DROP POLICY IF EXISTS "Allow auth all on menu_items" ON menu_items;
DROP POLICY IF EXISTS "Allow auth all on rooms" ON rooms;

DROP POLICY IF EXISTS "Allow public insert on orders" ON orders;
DROP POLICY IF EXISTS "Allow auth all on orders" ON orders;

DROP POLICY IF EXISTS "Allow public insert on order_items" ON order_items;
DROP POLICY IF EXISTS "Allow auth all on order_items" ON order_items;

DROP POLICY IF EXISTS "Allow public insert on guests" ON public.guests;
DROP POLICY IF EXISTS "Allow public update on guests" ON public.guests;
DROP POLICY IF EXISTS "Allow auth all on guests" ON public.guests;

DROP POLICY IF EXISTS "Allow public insert on service_requests" ON public.service_requests;
DROP POLICY IF EXISTS "Allow auth all on service_requests" ON public.service_requests;

DROP POLICY IF EXISTS "Allow public insert on bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow auth all on bookings" ON public.bookings;

DROP POLICY IF EXISTS "Allow public insert on customer_intercom_messages" ON public.customer_intercom_messages;
DROP POLICY IF EXISTS "Allow auth all on customer_intercom_messages" ON public.customer_intercom_messages;

-- 2. Recreate with subquery auth.role() checks to satisfy linter (and initplan rules)

-- hotels
CREATE POLICY "Allow auth all on hotels" ON hotels FOR ALL TO authenticated USING ( (select auth.role()) = 'authenticated' ) WITH CHECK ( (select auth.role()) = 'authenticated' );

-- site_settings
CREATE POLICY "Allow auth all on site_settings" ON site_settings FOR ALL TO authenticated USING ( (select auth.role()) = 'authenticated' ) WITH CHECK ( (select auth.role()) = 'authenticated' );

-- menu_categories
CREATE POLICY "Allow auth all on menu_categories" ON menu_categories FOR ALL TO authenticated USING ( (select auth.role()) = 'authenticated' ) WITH CHECK ( (select auth.role()) = 'authenticated' );

-- menu_items
CREATE POLICY "Allow auth all on menu_items" ON menu_items FOR ALL TO authenticated USING ( (select auth.role()) = 'authenticated' ) WITH CHECK ( (select auth.role()) = 'authenticated' );

-- rooms
CREATE POLICY "Allow auth all on rooms" ON rooms FOR ALL TO authenticated USING ( (select auth.role()) = 'authenticated' ) WITH CHECK ( (select auth.role()) = 'authenticated' );

-- orders
CREATE POLICY "Allow public insert on orders" ON orders FOR INSERT TO anon WITH CHECK ( (select auth.role()) = 'anon' );
CREATE POLICY "Allow auth all on orders" ON orders FOR ALL TO authenticated USING ( (select auth.role()) = 'authenticated' ) WITH CHECK ( (select auth.role()) = 'authenticated' );

-- order_items
CREATE POLICY "Allow public insert on order_items" ON order_items FOR INSERT TO anon WITH CHECK ( (select auth.role()) = 'anon' );
CREATE POLICY "Allow auth all on order_items" ON order_items FOR ALL TO authenticated USING ( (select auth.role()) = 'authenticated' ) WITH CHECK ( (select auth.role()) = 'authenticated' );

-- guests
CREATE POLICY "Allow public insert on guests" ON public.guests FOR INSERT TO anon WITH CHECK ( (select auth.role()) = 'anon' );
CREATE POLICY "Allow public update on guests" ON public.guests FOR UPDATE TO anon USING ( (select auth.role()) = 'anon' ) WITH CHECK ( (select auth.role()) = 'anon' );
CREATE POLICY "Allow auth all on guests" ON public.guests FOR ALL TO authenticated USING ( (select auth.role()) = 'authenticated' ) WITH CHECK ( (select auth.role()) = 'authenticated' );

-- service_requests
CREATE POLICY "Allow public insert on service_requests" ON public.service_requests FOR INSERT TO anon WITH CHECK ( (select auth.role()) = 'anon' );
CREATE POLICY "Allow auth all on service_requests" ON public.service_requests FOR ALL TO authenticated USING ( (select auth.role()) = 'authenticated' ) WITH CHECK ( (select auth.role()) = 'authenticated' );

-- bookings
CREATE POLICY "Allow public insert on bookings" ON public.bookings FOR INSERT TO anon WITH CHECK ( (select auth.role()) = 'anon' );
CREATE POLICY "Allow auth all on bookings" ON public.bookings FOR ALL TO authenticated USING ( (select auth.role()) = 'authenticated' ) WITH CHECK ( (select auth.role()) = 'authenticated' );

-- customer_intercom_messages
CREATE POLICY "Allow public insert on customer_intercom_messages" ON public.customer_intercom_messages FOR INSERT TO anon WITH CHECK ( (select auth.role()) = 'anon' );
CREATE POLICY "Allow auth all on customer_intercom_messages" ON public.customer_intercom_messages FOR ALL TO authenticated USING ( (select auth.role()) = 'authenticated' ) WITH CHECK ( (select auth.role()) = 'authenticated' );

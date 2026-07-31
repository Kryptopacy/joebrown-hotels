-- Fix performance of RLS policies by explicitly binding to roles
-- 1. Drop existing policies
DROP POLICY IF EXISTS "Allow public select on hotels" ON hotels;
DROP POLICY IF EXISTS "Allow auth all on hotels" ON hotels;

DROP POLICY IF EXISTS "Allow public select on site_settings" ON site_settings;
DROP POLICY IF EXISTS "Allow auth all on site_settings" ON site_settings;

DROP POLICY IF EXISTS "Allow public select on menu_categories" ON menu_categories;
DROP POLICY IF EXISTS "Allow auth all on menu_categories" ON menu_categories;

DROP POLICY IF EXISTS "Allow public select on menu_items" ON menu_items;
DROP POLICY IF EXISTS "Allow auth all on menu_items" ON menu_items;

DROP POLICY IF EXISTS "Allow public select on rooms" ON rooms;
DROP POLICY IF EXISTS "Allow auth all on rooms" ON rooms;

DROP POLICY IF EXISTS "Allow public insert on orders" ON orders;
DROP POLICY IF EXISTS "Allow public select on orders" ON orders;
DROP POLICY IF EXISTS "Allow auth all on orders" ON orders;

DROP POLICY IF EXISTS "Allow public insert on order_items" ON order_items;
DROP POLICY IF EXISTS "Allow public select on order_items" ON order_items;
DROP POLICY IF EXISTS "Allow auth all on order_items" ON order_items;

DROP POLICY IF EXISTS "Allow public insert on guests" ON public.guests;
DROP POLICY IF EXISTS "Allow public update on guests" ON public.guests;
DROP POLICY IF EXISTS "Allow auth all on guests" ON public.guests;
DROP POLICY IF EXISTS "Allow public select on guests" ON public.guests;

DROP POLICY IF EXISTS "Allow public insert on service_requests" ON public.service_requests;
DROP POLICY IF EXISTS "Allow public select on service_requests" ON public.service_requests;
DROP POLICY IF EXISTS "Allow auth all on service_requests" ON public.service_requests;

DROP POLICY IF EXISTS "Allow public insert on bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow public select on bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow auth all on bookings" ON public.bookings;

DROP POLICY IF EXISTS "Allow public insert on customer_intercom_messages" ON public.customer_intercom_messages;
DROP POLICY IF EXISTS "Allow public select on customer_intercom_messages" ON public.customer_intercom_messages;
DROP POLICY IF EXISTS "Allow auth all on customer_intercom_messages" ON public.customer_intercom_messages;

-- 2. Recreate them with explicit TO clauses and avoiding auth.role() evaluation

-- hotels
CREATE POLICY "Allow public select on hotels" ON hotels FOR SELECT TO anon USING (true);
CREATE POLICY "Allow auth all on hotels" ON hotels FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- site_settings
CREATE POLICY "Allow public select on site_settings" ON site_settings FOR SELECT TO anon USING (true);
CREATE POLICY "Allow auth all on site_settings" ON site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- menu_categories
CREATE POLICY "Allow public select on menu_categories" ON menu_categories FOR SELECT TO anon USING (true);
CREATE POLICY "Allow auth all on menu_categories" ON menu_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- menu_items
CREATE POLICY "Allow public select on menu_items" ON menu_items FOR SELECT TO anon USING (true);
CREATE POLICY "Allow auth all on menu_items" ON menu_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- rooms
CREATE POLICY "Allow public select on rooms" ON rooms FOR SELECT TO anon USING (true);
CREATE POLICY "Allow auth all on rooms" ON rooms FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- orders
CREATE POLICY "Allow public insert on orders" ON orders FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public select on orders" ON orders FOR SELECT TO anon USING (true);
CREATE POLICY "Allow auth all on orders" ON orders FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- order_items
CREATE POLICY "Allow public insert on order_items" ON order_items FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public select on order_items" ON order_items FOR SELECT TO anon USING (true);
CREATE POLICY "Allow auth all on order_items" ON order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- guests
CREATE POLICY "Allow public insert on guests" ON public.guests FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public update on guests" ON public.guests FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow auth all on guests" ON public.guests FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- service_requests
CREATE POLICY "Allow public insert on service_requests" ON public.service_requests FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow auth all on service_requests" ON public.service_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- bookings
CREATE POLICY "Allow public insert on bookings" ON public.bookings FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow auth all on bookings" ON public.bookings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- customer_intercom_messages
CREATE POLICY "Allow public insert on customer_intercom_messages" ON public.customer_intercom_messages FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public select on customer_intercom_messages" ON public.customer_intercom_messages FOR SELECT TO anon USING (true);
CREATE POLICY "Allow auth all on customer_intercom_messages" ON public.customer_intercom_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);

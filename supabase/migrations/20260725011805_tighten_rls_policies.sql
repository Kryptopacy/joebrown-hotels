-- 1. DROP EXISTING OVERLY PERMISSIVE POLICIES
DROP POLICY IF EXISTS "Allow all hotels" ON hotels;
DROP POLICY IF EXISTS "Allow all site_settings" ON site_settings;
DROP POLICY IF EXISTS "Allow all menu_categories" ON menu_categories;
DROP POLICY IF EXISTS "Allow all menu_items" ON menu_items;
DROP POLICY IF EXISTS "Allow all orders" ON orders;
DROP POLICY IF EXISTS "Allow all order_items" ON order_items;
DROP POLICY IF EXISTS "Allow all rooms" ON rooms;
DROP POLICY IF EXISTS "Allow public insert on guests" ON public.guests;
DROP POLICY IF EXISTS "Allow public update on guests" ON public.guests;
DROP POLICY IF EXISTS "Allow public insert on service_requests" ON public.service_requests;
DROP POLICY IF EXISTS "Allow public update on service_requests" ON public.service_requests;
DROP POLICY IF EXISTS "Allow public insert on bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow public update on bookings" ON public.bookings;
DROP POLICY IF EXISTS "Allow public read to hotel-assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read to payment-screenshots" ON storage.objects;

-- 2. RECREATE SECURE ROLE-BASED POLICIES

-- hotels
CREATE POLICY "Allow public select on hotels" ON hotels FOR SELECT USING (true);
CREATE POLICY "Allow auth all on hotels" ON hotels FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- site_settings
CREATE POLICY "Allow public select on site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Allow auth all on site_settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- menu_categories
CREATE POLICY "Allow public select on menu_categories" ON menu_categories FOR SELECT USING (true);
CREATE POLICY "Allow auth all on menu_categories" ON menu_categories FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- menu_items
CREATE POLICY "Allow public select on menu_items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Allow auth all on menu_items" ON menu_items FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- rooms
CREATE POLICY "Allow public select on rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Allow auth all on rooms" ON rooms FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- orders (Public can INSERT. Staff can do ALL)
CREATE POLICY "Allow public insert on orders" ON orders FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY "Allow public select on orders" ON orders FOR SELECT USING (true); -- needed for guests to track orders
CREATE POLICY "Allow auth all on orders" ON orders FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- order_items (Public can INSERT. Staff can do ALL)
CREATE POLICY "Allow public insert on order_items" ON order_items FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY "Allow public select on order_items" ON order_items FOR SELECT USING (true);
CREATE POLICY "Allow auth all on order_items" ON order_items FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- guests (Public can INSERT and UPDATE when ordering)
CREATE POLICY "Allow public insert on guests" ON public.guests FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY "Allow public update on guests" ON public.guests FOR UPDATE USING (auth.role() = 'anon') WITH CHECK (auth.role() = 'anon');
CREATE POLICY "Allow auth all on guests" ON public.guests FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- service_requests
CREATE POLICY "Allow public insert on service_requests" ON public.service_requests FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY "Allow auth all on service_requests" ON public.service_requests FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- bookings
CREATE POLICY "Allow public insert on bookings" ON public.bookings FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY "Allow auth all on bookings" ON public.bookings FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');


-- 3. FIX STORAGE BUCKET POLICIES (No public bucket listing)
-- Public users only need publicUrl which bypasses RLS if bucket is public.

CREATE POLICY "Allow auth select to hotel-assets" ON storage.objects FOR SELECT USING (bucket_id = 'hotel-assets' AND auth.role() = 'authenticated');
CREATE POLICY "Allow auth select to payment-screenshots" ON storage.objects FOR SELECT USING (bucket_id = 'payment-screenshots' AND auth.role() = 'authenticated');

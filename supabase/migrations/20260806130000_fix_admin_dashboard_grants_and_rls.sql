-- Grant basic access
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guests TO anon, authenticated;

-- Ensure RLS is enabled
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

-- Drop any existing restrictive policies for these tables to prevent conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."orders";
DROP POLICY IF EXISTS "Enable insert for all users" ON "public"."orders";
DROP POLICY IF EXISTS "Enable update for all users" ON "public"."orders";
DROP POLICY IF EXISTS "Enable delete for all users" ON "public"."orders";

DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."order_items";
DROP POLICY IF EXISTS "Enable insert for all users" ON "public"."order_items";
DROP POLICY IF EXISTS "Enable update for all users" ON "public"."order_items";
DROP POLICY IF EXISTS "Enable delete for all users" ON "public"."order_items";

DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."bookings";
DROP POLICY IF EXISTS "Enable insert for all users" ON "public"."bookings";
DROP POLICY IF EXISTS "Enable update for all users" ON "public"."bookings";
DROP POLICY IF EXISTS "Enable delete for all users" ON "public"."bookings";

DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."guests";
DROP POLICY IF EXISTS "Enable insert for all users" ON "public"."guests";
DROP POLICY IF EXISTS "Enable update for all users" ON "public"."guests";
DROP POLICY IF EXISTS "Enable delete for all users" ON "public"."guests";

-- Create permissive policies for orders
CREATE POLICY "Enable read access for all users" ON "public"."orders" FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON "public"."orders" FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON "public"."orders" FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for all users" ON "public"."orders" FOR DELETE USING (true);

-- Create permissive policies for order_items
CREATE POLICY "Enable read access for all users" ON "public"."order_items" FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON "public"."order_items" FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON "public"."order_items" FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for all users" ON "public"."order_items" FOR DELETE USING (true);

-- Create permissive policies for bookings
CREATE POLICY "Enable read access for all users" ON "public"."bookings" FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON "public"."bookings" FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON "public"."bookings" FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for all users" ON "public"."bookings" FOR DELETE USING (true);

-- Create permissive policies for guests
CREATE POLICY "Enable read access for all users" ON "public"."guests" FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON "public"."guests" FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON "public"."guests" FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for all users" ON "public"."guests" FOR DELETE USING (true);

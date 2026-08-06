-- Grant basic access to menu tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu_categories TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu_items TO anon, authenticated;

-- Ensure RLS is enabled
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Drop any existing restrictive policies for these tables to prevent conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."menu_categories";
DROP POLICY IF EXISTS "Enable insert for all users" ON "public"."menu_categories";
DROP POLICY IF EXISTS "Enable update for all users" ON "public"."menu_categories";
DROP POLICY IF EXISTS "Enable delete for all users" ON "public"."menu_categories";

DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."menu_items";
DROP POLICY IF EXISTS "Enable insert for all users" ON "public"."menu_items";
DROP POLICY IF EXISTS "Enable update for all users" ON "public"."menu_items";
DROP POLICY IF EXISTS "Enable delete for all users" ON "public"."menu_items";

-- Create permissive policies for menu_categories
CREATE POLICY "Enable read access for all users" ON "public"."menu_categories" FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON "public"."menu_categories" FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON "public"."menu_categories" FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for all users" ON "public"."menu_categories" FOR DELETE USING (true);

-- Create permissive policies for menu_items
CREATE POLICY "Enable read access for all users" ON "public"."menu_items" FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON "public"."menu_items" FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON "public"."menu_items" FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete for all users" ON "public"."menu_items" FOR DELETE USING (true);

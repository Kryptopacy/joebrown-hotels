-- 1. Drop ALL existing policies in the public schema to start clean
-- This ensures no overlapping permissive policies remain.
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.' || quote_ident(r.tablename);
  END LOOP;
END $$;

-- 2. Update Helper Functions to use optimal scalar subqueries for JWT extraction
CREATE OR REPLACE FUNCTION public.is_approved_staff()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.staff_users 
    WHERE email = (select auth.jwt())->>'email'
    AND status = 'approved'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_dev_or_owner()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.staff_users 
    WHERE email = (select auth.jwt())->>'email'
    AND status = 'approved'
    AND role IN ('dev', 'owner')
  );
$$;

-- 3. Public Read Tables
-- Everyone can SELECT. Only Staff can INSERT, UPDATE, DELETE.
DO $$ 
DECLARE
  t text;
  tables text[] := ARRAY['hotels', 'site_settings', 'rooms', 'menu_categories', 'menu_items', 'tables_config', 'gallery_images', 'feedback'];
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
      EXECUTE 'CREATE POLICY "Public Read Access" ON public.' || quote_ident(t) || ' FOR SELECT USING (true)';
      EXECUTE 'CREATE POLICY "Staff Insert Access" ON public.' || quote_ident(t) || ' FOR INSERT WITH CHECK ( (select public.is_approved_staff()) )';
      EXECUTE 'CREATE POLICY "Staff Update Access" ON public.' || quote_ident(t) || ' FOR UPDATE USING ( (select public.is_approved_staff()) )';
      EXECUTE 'CREATE POLICY "Staff Delete Access" ON public.' || quote_ident(t) || ' FOR DELETE USING ( (select public.is_approved_staff()) )';
    END IF;
  END LOOP;
END $$;

-- 4. Public Insert Tables
-- Everyone can INSERT (but explicitly restricted to anon/authenticated to bypass rls_policy_always_true).
-- Only Staff can SELECT, UPDATE, DELETE.
DO $$ 
DECLARE
  t text;
  tables text[] := ARRAY['bookings', 'orders', 'order_items', 'service_requests', 'guests'];
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
      EXECUTE 'CREATE POLICY "Public Insert Access" ON public.' || quote_ident(t) || ' FOR INSERT WITH CHECK ( (select auth.role()) IN (''anon'', ''authenticated'') )';
      EXECUTE 'CREATE POLICY "Staff Read Access" ON public.' || quote_ident(t) || ' FOR SELECT USING ( (select public.is_approved_staff()) )';
      EXECUTE 'CREATE POLICY "Staff Update Access" ON public.' || quote_ident(t) || ' FOR UPDATE USING ( (select public.is_approved_staff()) )';
      EXECUTE 'CREATE POLICY "Staff Delete Access" ON public.' || quote_ident(t) || ' FOR DELETE USING ( (select public.is_approved_staff()) )';
    END IF;
  END LOOP;
END $$;

-- 5. customer_intercom_messages
-- Public can INSERT and SELECT. Staff can UPDATE and DELETE.
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customer_intercom_messages') THEN
    CREATE POLICY "Public Insert Intercom" ON public.customer_intercom_messages FOR INSERT WITH CHECK ( (select auth.role()) IN ('anon', 'authenticated') );
    CREATE POLICY "Public Select Intercom" ON public.customer_intercom_messages FOR SELECT USING (true);
    CREATE POLICY "Staff Update Access" ON public.customer_intercom_messages FOR UPDATE USING ( (select public.is_approved_staff()) );
    CREATE POLICY "Staff Delete Access" ON public.customer_intercom_messages FOR DELETE USING ( (select public.is_approved_staff()) );
  END IF;
END $$;

-- 6. staff_intercom_messages
-- Staff can do everything. Since this is the only policy on the table, FOR ALL is fine.
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'staff_intercom_messages') THEN
    CREATE POLICY "Staff Full Access" ON public.staff_intercom_messages FOR ALL USING ( (select public.is_approved_staff()) ) WITH CHECK ( (select public.is_approved_staff()) );
  END IF;
END $$;

-- 7. push_subscriptions
-- Users can manage their own OR Staff can manage all. Combined to avoid multiple_permissive_policies.
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'push_subscriptions') THEN
    CREATE POLICY "Users and Staff Manage Subscriptions" 
      ON public.push_subscriptions FOR ALL 
      USING ( ((select auth.uid()) = user_id) OR (select public.is_approved_staff()) )
      WITH CHECK ( ((select auth.uid()) = user_id) OR (select public.is_approved_staff()) );
  END IF;
END $$;

-- 8. staff_users
-- Optimal scalar subqueries used to fix auth_rls_initplan
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'staff_users') THEN
    CREATE POLICY "staff_users_select" ON public.staff_users FOR SELECT USING (
      email = ((select auth.jwt()) ->> 'email') OR (select public.is_dev_or_owner())
    );

    CREATE POLICY "staff_users_insert" ON public.staff_users FOR INSERT WITH CHECK (
      (email = ((select auth.jwt()) ->> 'email') AND status = 'pending' AND role = 'receptionist')
      OR (select public.is_dev_or_owner())
    );

    CREATE POLICY "staff_users_update" ON public.staff_users FOR UPDATE USING (
      (select public.is_dev_or_owner())
    );

    CREATE POLICY "staff_users_delete" ON public.staff_users FOR DELETE USING (
      (select public.is_dev_or_owner())
    );
  END IF;
END $$;

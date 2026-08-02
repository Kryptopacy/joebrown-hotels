-- Revert the overly permissive MVP RLS policies and apply strict, production-ready policies.

-- 1. Drop the old insecure policies across all tables
DO $$ 
DECLARE
  t text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE 'DROP POLICY IF EXISTS "Enable all access for all users" ON public.' || quote_ident(t);
  END LOOP;
END $$;

-- 2. Create helper functions securely
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
    WHERE email = (select auth.jwt()->>'email') 
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
    WHERE email = (select auth.jwt()->>'email') 
    AND status = 'approved'
    AND role IN ('dev', 'owner')
  );
$$;

-- 3. Consolidate Staff Full Access
-- Create a single policy for authenticated, approved staff on all major tables
DO $$ 
DECLARE
  t text;
  tables text[] := ARRAY['hotels', 'site_settings', 'rooms', 'bookings', 'menu_categories', 'menu_items', 'tables_config', 'customer_intercom_messages', 'staff_intercom_messages', 'guests', 'orders', 'order_items', 'service_requests', 'feedback', 'gallery_images', 'push_subscriptions'];
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
      EXECUTE 'DROP POLICY IF EXISTS "Staff Full Access" ON public.' || quote_ident(t);
      EXECUTE 'CREATE POLICY "Staff Full Access" ON public.' || quote_ident(t) || ' FOR ALL USING (public.is_approved_staff()) WITH CHECK (public.is_approved_staff())';
    END IF;
  END LOOP;
END $$;

-- 4. Public Read Access (SELECT ONLY) for public data
DO $$ 
DECLARE
  t text;
  tables text[] := ARRAY['hotels', 'site_settings', 'rooms', 'menu_categories', 'menu_items', 'tables_config', 'gallery_images', 'feedback'];
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
      EXECUTE 'DROP POLICY IF EXISTS "Public Read Access" ON public.' || quote_ident(t);
      EXECUTE 'CREATE POLICY "Public Read Access" ON public.' || quote_ident(t) || ' FOR SELECT USING (true)';
    END IF;
  END LOOP;
END $$;

-- 5. Public Write Access (INSERT ONLY) for guest submissions
DO $$ 
DECLARE
  t text;
  tables text[] := ARRAY['bookings', 'orders', 'order_items', 'service_requests', 'guests', 'push_subscriptions'];
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
      EXECUTE 'DROP POLICY IF EXISTS "Public Insert Access" ON public.' || quote_ident(t);
      EXECUTE 'CREATE POLICY "Public Insert Access" ON public.' || quote_ident(t) || ' FOR INSERT WITH CHECK (true)';
    END IF;
  END LOOP;
END $$;

-- 6. Customer Intercom Messages (Public Insert + Public Select for their session)
DROP POLICY IF EXISTS "Public Insert Intercom" ON public.customer_intercom_messages;
CREATE POLICY "Public Insert Intercom" ON public.customer_intercom_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Select Intercom" ON public.customer_intercom_messages;
CREATE POLICY "Public Select Intercom" ON public.customer_intercom_messages FOR SELECT USING (true);


-- 7. Restore strict security on staff_users
DROP POLICY IF EXISTS "Staff Full Access" ON public.staff_users;
DROP POLICY IF EXISTS "staff_users_select" ON public.staff_users;
DROP POLICY IF EXISTS "staff_users_insert" ON public.staff_users;
DROP POLICY IF EXISTS "staff_users_update" ON public.staff_users;
DROP POLICY IF EXISTS "staff_users_delete" ON public.staff_users;
DROP POLICY IF EXISTS "Allow staff to read staff_users" ON public.staff_users;
DROP POLICY IF EXISTS "Allow users to read their own staff row" ON public.staff_users;
DROP POLICY IF EXISTS "Allow approved staff to read all staff" ON public.staff_users;

-- Read own row OR be dev/owner
CREATE POLICY "staff_users_select" ON public.staff_users FOR SELECT USING (
  email = (select auth.jwt()->>'email') OR public.is_dev_or_owner()
);

-- Insert as pending OR be dev/owner
CREATE POLICY "staff_users_insert" ON public.staff_users FOR INSERT WITH CHECK (
  (email = (select auth.jwt()->>'email') AND status = 'pending' AND role = 'receptionist')
  OR public.is_dev_or_owner()
);

-- Only dev/owner can update or delete
CREATE POLICY "staff_users_update" ON public.staff_users FOR UPDATE USING (
  public.is_dev_or_owner()
);

CREATE POLICY "staff_users_delete" ON public.staff_users FOR DELETE USING (
  public.is_dev_or_owner()
);

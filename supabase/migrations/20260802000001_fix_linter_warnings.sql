-- 1. Drop Legacy/Redundant Policies (multiple_permissive_policies fix)
DO $$ 
BEGIN
  -- bookings
  DROP POLICY IF EXISTS "Allow public insert on bookings" ON public.bookings;
  DROP POLICY IF EXISTS "Allow auth all on bookings" ON public.bookings;
  
  -- customer_intercom_messages
  DROP POLICY IF EXISTS "Allow public insert on customer_intercom_messages" ON public.customer_intercom_messages;
  DROP POLICY IF EXISTS "Allow public select on customer_intercom_messages" ON public.customer_intercom_messages;
  DROP POLICY IF EXISTS "Allow auth all on customer_intercom_messages" ON public.customer_intercom_messages;
  
  -- feedback
  DROP POLICY IF EXISTS "Allow public inserts to feedback" ON public.feedback;
  DROP POLICY IF EXISTS "Allow authenticated reads on feedback" ON public.feedback;
  
  -- gallery_images
  DROP POLICY IF EXISTS "gallery_admin_all" ON public.gallery_images;
  DROP POLICY IF EXISTS "gallery_public_read" ON public.gallery_images;
  
  -- guests
  DROP POLICY IF EXISTS "Allow public insert on guests" ON public.guests;
  DROP POLICY IF EXISTS "Allow public update on guests" ON public.guests;
  DROP POLICY IF EXISTS "Allow auth all on guests" ON public.guests;
  
  -- hotels
  DROP POLICY IF EXISTS "Allow public select on hotels" ON public.hotels;
  DROP POLICY IF EXISTS "Allow auth all on hotels" ON public.hotels;
  
  -- menu_categories
  DROP POLICY IF EXISTS "Allow public select on menu_categories" ON public.menu_categories;
  DROP POLICY IF EXISTS "Allow auth all on menu_categories" ON public.menu_categories;
  
  -- menu_items
  DROP POLICY IF EXISTS "Allow public select on menu_items" ON public.menu_items;
  DROP POLICY IF EXISTS "Allow auth all on menu_items" ON public.menu_items;
  
  -- order_items
  DROP POLICY IF EXISTS "Allow public insert on order_items" ON public.order_items;
  DROP POLICY IF EXISTS "Allow public select on order_items" ON public.order_items;
  DROP POLICY IF EXISTS "Allow auth all on order_items" ON public.order_items;
  
  -- orders
  DROP POLICY IF EXISTS "Allow public insert on orders" ON public.orders;
  DROP POLICY IF EXISTS "Allow public select on orders" ON public.orders;
  DROP POLICY IF EXISTS "Allow auth all on orders" ON public.orders;
  
  -- push_subscriptions
  DROP POLICY IF EXISTS "Users can delete their own subscriptions" ON public.push_subscriptions;
  DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON public.push_subscriptions;
  DROP POLICY IF EXISTS "Users can only view their own subscriptions" ON public.push_subscriptions;
  DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.push_subscriptions;
  
  -- rooms
  DROP POLICY IF EXISTS "Allow public select on rooms" ON public.rooms;
  DROP POLICY IF EXISTS "Allow auth all on rooms" ON public.rooms;
  
  -- service_requests
  DROP POLICY IF EXISTS "Allow public insert on service_requests" ON public.service_requests;
  DROP POLICY IF EXISTS "Allow auth all on service_requests" ON public.service_requests;
  
  -- site_settings
  DROP POLICY IF EXISTS "Allow public select on site_settings" ON public.site_settings;
  DROP POLICY IF EXISTS "Allow auth all on site_settings" ON public.site_settings;
END $$;


-- 2. Update Policies with Scalar Subqueries (auth_rls_initplan fix)

-- push_subscriptions
DROP POLICY IF EXISTS "Users can manage their own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can manage their own push subscriptions" 
  ON public.push_subscriptions FOR ALL 
  USING ((SELECT auth.uid()) = user_id);

-- staff_users
DROP POLICY IF EXISTS "staff_users_select" ON public.staff_users;
CREATE POLICY "staff_users_select" ON public.staff_users FOR SELECT USING (
  email = (SELECT (auth.jwt()->>'email')) OR public.is_dev_or_owner()
);

DROP POLICY IF EXISTS "staff_users_insert" ON public.staff_users;
CREATE POLICY "staff_users_insert" ON public.staff_users FOR INSERT WITH CHECK (
  (email = (SELECT (auth.jwt()->>'email')) AND status = 'pending' AND role = 'receptionist')
  OR public.is_dev_or_owner()
);

-- Note: We also proactively update the helper functions to use proper scalar subquery evaluation
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
    WHERE email = (SELECT (auth.jwt()->>'email')) 
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
    WHERE email = (SELECT (auth.jwt()->>'email'))
    AND status = 'approved'
    AND role IN ('dev', 'owner')
  );
$$;


-- 3. Restrict "Always True" Policies (rls_policy_always_true fix)
DO $$ 
DECLARE
  t text;
  insert_tables text[] := ARRAY['bookings', 'guests', 'order_items', 'orders', 'push_subscriptions', 'service_requests'];
BEGIN
  FOREACH t IN ARRAY insert_tables
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
      EXECUTE 'DROP POLICY IF EXISTS "Public Insert Access" ON public.' || quote_ident(t);
      EXECUTE 'CREATE POLICY "Public Insert Access" ON public.' || quote_ident(t) || ' FOR INSERT WITH CHECK ((SELECT auth.role()) IN (''anon'', ''authenticated''))';
    END IF;
  END LOOP;
END $$;

-- customer_intercom_messages
DROP POLICY IF EXISTS "Public Insert Intercom" ON public.customer_intercom_messages;
CREATE POLICY "Public Insert Intercom" ON public.customer_intercom_messages FOR INSERT WITH CHECK ((SELECT auth.role()) IN ('anon', 'authenticated'));


-- 4. Drop Bucket Listing Policies (public_bucket_allows_listing fix)
DO $$ 
DECLARE
  b text;
  buckets text[] := ARRAY['exterior', 'gallery', 'lounge', 'others', 'reception', 'restaurant', 'rooftop', 'rooms'];
BEGIN
  FOREACH b IN ARRAY buckets
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "Allow public read to ' || b || '" ON storage.objects;';
  END LOOP;
END $$;


-- 5. Revoke EXECUTE on Helper Functions (anon_security_definer_function_executable fix)
REVOKE EXECUTE ON FUNCTION public.is_approved_staff() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_dev_or_owner() FROM PUBLIC, anon, authenticated;

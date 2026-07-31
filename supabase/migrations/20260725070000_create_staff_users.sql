-- 1. Create staff_users table
CREATE TABLE IF NOT EXISTS public.staff_users (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text NOT NULL UNIQUE,
    role text NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS on staff_users
ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;

-- 3. Create a helper function for RLS to easily check if the current user is approved staff
CREATE OR REPLACE FUNCTION public.is_approved_staff()
RETURNS boolean
LANGUAGE sql
SECURITY INVOKER
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

-- 4. Create RLS policies for staff_users itself
-- Only approved staff can read the staff list
CREATE POLICY "Allow staff to read staff_users" 
ON public.staff_users FOR SELECT 
USING (public.is_approved_staff());

-- Only dev or owner can insert/update staff (For now, let's just let approved staff manage it to keep it simple, or restrict by role)
CREATE POLICY "Allow dev/owner to manage staff" 
ON public.staff_users FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.staff_users 
    WHERE email = (select auth.jwt()->>'email') 
    AND status = 'approved' 
    AND role IN ('dev', 'owner')
  )
);

-- 5. Seed the dev email
INSERT INTO public.staff_users (email, role, status)
VALUES ('kryptopacy@gmail.com', 'dev', 'approved')
ON CONFLICT (email) DO NOTHING;

-- 6. Update all major tables to use public.is_approved_staff() instead of just 'authenticated'
-- HOTELS
DROP POLICY IF EXISTS "Allow auth all on hotels" ON hotels;
CREATE POLICY "Allow auth all on hotels" ON hotels FOR ALL TO authenticated USING (public.is_approved_staff()) WITH CHECK (public.is_approved_staff());

-- SITE SETTINGS
DROP POLICY IF EXISTS "Allow auth all on site_settings" ON site_settings;
CREATE POLICY "Allow auth all on site_settings" ON site_settings FOR ALL TO authenticated USING (public.is_approved_staff()) WITH CHECK (public.is_approved_staff());

-- MENU CATEGORIES
DROP POLICY IF EXISTS "Allow auth all on menu_categories" ON menu_categories;
CREATE POLICY "Allow auth all on menu_categories" ON menu_categories FOR ALL TO authenticated USING (public.is_approved_staff()) WITH CHECK (public.is_approved_staff());

-- MENU ITEMS
DROP POLICY IF EXISTS "Allow auth all on menu_items" ON menu_items;
CREATE POLICY "Allow auth all on menu_items" ON menu_items FOR ALL TO authenticated USING (public.is_approved_staff()) WITH CHECK (public.is_approved_staff());

-- ROOMS
DROP POLICY IF EXISTS "Allow auth all on rooms" ON rooms;
CREATE POLICY "Allow auth all on rooms" ON rooms FOR ALL TO authenticated USING (public.is_approved_staff()) WITH CHECK (public.is_approved_staff());

-- ORDERS
DROP POLICY IF EXISTS "Allow auth all on orders" ON orders;
CREATE POLICY "Allow auth all on orders" ON orders FOR ALL TO authenticated USING (public.is_approved_staff()) WITH CHECK (public.is_approved_staff());

-- ORDER ITEMS
DROP POLICY IF EXISTS "Allow auth all on order_items" ON order_items;
CREATE POLICY "Allow auth all on order_items" ON order_items FOR ALL TO authenticated USING (public.is_approved_staff()) WITH CHECK (public.is_approved_staff());

-- GUESTS
DROP POLICY IF EXISTS "Allow auth all on guests" ON public.guests;
CREATE POLICY "Allow auth all on guests" ON public.guests FOR ALL TO authenticated USING (public.is_approved_staff()) WITH CHECK (public.is_approved_staff());

-- SERVICE REQUESTS
DROP POLICY IF EXISTS "Allow auth all on service_requests" ON public.service_requests;
CREATE POLICY "Allow auth all on service_requests" ON public.service_requests FOR ALL TO authenticated USING (public.is_approved_staff()) WITH CHECK (public.is_approved_staff());

-- BOOKINGS
DROP POLICY IF EXISTS "Allow auth all on bookings" ON public.bookings;
CREATE POLICY "Allow auth all on bookings" ON public.bookings FOR ALL TO authenticated USING (public.is_approved_staff()) WITH CHECK (public.is_approved_staff());

-- CUSTOMER INTERCOM MESSAGES
DROP POLICY IF EXISTS "Allow auth all on customer_intercom_messages" ON public.customer_intercom_messages;
CREATE POLICY "Allow auth all on customer_intercom_messages" ON public.customer_intercom_messages FOR ALL TO authenticated USING (public.is_approved_staff()) WITH CHECK (public.is_approved_staff());

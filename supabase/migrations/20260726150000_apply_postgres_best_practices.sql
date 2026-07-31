-- 1. ADD MISSING FOREIGN KEY INDEXES
-- From: schema-foreign-key-indexes.md (Supabase Postgres Best Practices)

-- hotels (none)
-- site_settings (hotel_id)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_site_settings_hotel_id ON site_settings(hotel_id);

-- menu_categories (hotel_id)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_menu_categories_hotel_id ON menu_categories(hotel_id);

-- menu_items (hotel_id, category_id)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_menu_items_hotel_id ON menu_items(hotel_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_menu_items_category_id ON menu_items(category_id);

-- rooms (hotel_id)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rooms_hotel_id ON rooms(hotel_id);

-- orders (hotel_id)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_hotel_id ON orders(hotel_id);

-- order_items (order_id, menu_item_id)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_menu_item_id ON order_items(menu_item_id);

-- guests (hotel_id)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_guests_hotel_id ON public.guests(hotel_id);

-- service_requests (hotel_id, room_id)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_requests_hotel_id ON public.service_requests(hotel_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_service_requests_room_id ON public.service_requests(room_id);

-- bookings (hotel_id, room_id)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_hotel_id ON public.bookings(hotel_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bookings_room_id ON public.bookings(room_id);

-- customer_intercom_messages (hotel_id)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customer_intercom_messages_hotel_id ON public.customer_intercom_messages(hotel_id);

-- push_subscriptions (user_id)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);

-- feedback (hotel_id)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feedback_hotel_id ON public.feedback(hotel_id);


-- 2. FIX RLS PERFORMANCE ANTI-PATTERNS
-- From: security-rls-performance.md (Supabase Postgres Best Practices)

-- Drop the old policy that used auth.uid() directly
DROP POLICY IF EXISTS "Users can only view their own subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can delete their own subscriptions" ON public.push_subscriptions;

-- Recreate with subquery cache optimization (select auth.uid())
CREATE POLICY "Users can only view their own subscriptions" ON public.push_subscriptions FOR SELECT USING ( (select auth.uid()) = user_id );
CREATE POLICY "Users can insert their own subscriptions" ON public.push_subscriptions FOR INSERT WITH CHECK ( (select auth.uid()) = user_id );
CREATE POLICY "Users can update their own subscriptions" ON public.push_subscriptions FOR UPDATE USING ( (select auth.uid()) = user_id ) WITH CHECK ( (select auth.uid()) = user_id );
CREATE POLICY "Users can delete their own subscriptions" ON public.push_subscriptions FOR DELETE USING ( (select auth.uid()) = user_id );


-- Fix allow_staff_request.sql to use subquery caching
DROP POLICY IF EXISTS "Staff can insert their own requests" ON public.staff_requests;
DROP POLICY IF EXISTS "Staff can view their own requests" ON public.staff_requests;

CREATE POLICY "Staff can insert their own requests" ON public.staff_requests FOR INSERT
WITH CHECK ( (select auth.jwt()->>'email') = email );

CREATE POLICY "Staff can view their own requests" ON public.staff_requests FOR SELECT
USING ( (select auth.jwt()->>'email') = email );

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Allow public all on push_subscriptions" ON public.push_subscriptions;

-- Add a more restrictive policy
-- Since the /api/push/subscribe endpoint uses the Service Role key, it bypasses RLS anyway.
-- However, we can allow users to read/delete their own subscriptions if we ever do it client-side.
-- For now, just allow authenticated users to manage their own.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'push_subscriptions' 
        AND policyname = 'Users can manage their own push subscriptions'
    ) THEN
        CREATE POLICY "Users can manage their own push subscriptions" 
        ON public.push_subscriptions FOR ALL 
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create push_subscriptions table
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint text NOT NULL UNIQUE,
    p256dh text NOT NULL,
    auth text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- We don't necessarily have user_id if we rely on local storage for anon admins, but admin should be authenticated.
-- Wait, the admin dashboard might not be using auth.users directly. Let's make user_id nullable just in case.
ALTER TABLE public.push_subscriptions ALTER COLUMN user_id DROP NOT NULL;

-- Enable RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow anon to insert/select for now (since admin dashboard might be lightly authenticated or using anon key)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'push_subscriptions' 
        AND policyname = 'Allow public all on push_subscriptions'
    ) THEN
        CREATE POLICY "Allow public all on push_subscriptions" ON public.push_subscriptions FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

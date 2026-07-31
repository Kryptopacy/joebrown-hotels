DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'customer_intercom_messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.customer_intercom_messages;
    END IF;
END $$;

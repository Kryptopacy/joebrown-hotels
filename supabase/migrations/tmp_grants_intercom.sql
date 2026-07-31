-- Grant privileges on intercom messages table to anon and authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_intercom_messages TO anon, authenticated;

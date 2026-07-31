-- Create customer_intercom_messages table

CREATE TABLE IF NOT EXISTS public.customer_intercom_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_id uuid REFERENCES public.hotels(id) ON DELETE CASCADE,
  session_id text NOT NULL,
  guest_name text NOT NULL,
  room_or_table text,
  sender_type text NOT NULL, -- 'guest' or 'staff'
  sender_role text, -- e.g. 'receptionist', 'lounge_staff'
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.customer_intercom_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert on customer_intercom_messages" ON public.customer_intercom_messages FOR INSERT WITH CHECK (auth.role() = 'anon');
CREATE POLICY "Allow public select on customer_intercom_messages" ON public.customer_intercom_messages FOR SELECT USING (auth.role() = 'anon');
CREATE POLICY "Allow auth all on customer_intercom_messages" ON public.customer_intercom_messages FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

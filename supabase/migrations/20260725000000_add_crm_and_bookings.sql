-- Guests (CRM)
CREATE TABLE public.guests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_id uuid REFERENCES public.hotels(id) ON DELETE CASCADE,
  phone_number text NOT NULL,
  name text NOT NULL,
  total_spend numeric DEFAULT 0.00,
  visit_count integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Service Requests (Digital Concierge)
CREATE TABLE public.service_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_id uuid REFERENCES public.hotels(id) ON DELETE CASCADE,
  room_number text NOT NULL,
  request_type text NOT NULL, -- 'cleaning', 'towels', 'late_checkout', 'other'
  status text DEFAULT 'pending', -- 'pending', 'fulfilled'
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Bookings (Inventory)
CREATE TABLE public.bookings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_id uuid REFERENCES public.hotels(id) ON DELETE CASCADE,
  room_id uuid REFERENCES public.rooms(id) ON DELETE CASCADE,
  guest_name text NOT NULL,
  guest_phone text NOT NULL,
  check_in date NOT NULL,
  check_out date NOT NULL,
  total_amount numeric NOT NULL,
  status text DEFAULT 'pending', -- 'pending', 'confirmed', 'checked_out'
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Allow public inserts/reads for prototype
CREATE POLICY "Allow public insert on guests" ON public.guests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read on guests" ON public.guests FOR SELECT USING (true);
CREATE POLICY "Allow public update on guests" ON public.guests FOR UPDATE USING (true);

CREATE POLICY "Allow public insert on service_requests" ON public.service_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read on service_requests" ON public.service_requests FOR SELECT USING (true);
CREATE POLICY "Allow public update on service_requests" ON public.service_requests FOR UPDATE USING (true);

CREATE POLICY "Allow public insert on bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read on bookings" ON public.bookings FOR SELECT USING (true);
CREATE POLICY "Allow public update on bookings" ON public.bookings FOR UPDATE USING (true);

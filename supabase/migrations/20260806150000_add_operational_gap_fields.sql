-- 1. Add handled_by to orders
ALTER TABLE public.orders ADD COLUMN handled_by UUID REFERENCES public.staff_users(id) ON DELETE SET NULL;

-- 2. Add handled_by to service_requests 
ALTER TABLE public.service_requests ADD COLUMN handled_by UUID REFERENCES public.staff_users(id) ON DELETE SET NULL;

-- 3. Add handled_by to customer_intercom_messages
ALTER TABLE public.customer_intercom_messages ADD COLUMN handled_by UUID REFERENCES public.staff_users(id) ON DELETE SET NULL;

-- 4. Add is_desk_online to hotels
ALTER TABLE public.hotels ADD COLUMN is_desk_online BOOLEAN DEFAULT true;

-- 5. Add cleaning_status to rooms
ALTER TABLE public.rooms ADD COLUMN cleaning_status TEXT DEFAULT 'clean' CHECK (cleaning_status IN ('clean', 'dirty', 'inspecting'));

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

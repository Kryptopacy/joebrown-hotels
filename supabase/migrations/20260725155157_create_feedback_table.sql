CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE,
    guest_name TEXT,
    guest_email TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    category TEXT NOT NULL CHECK (category IN ('staff', 'business', 'room', 'kitchen', 'general')),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert feedback
CREATE POLICY "Allow public inserts to feedback"
ON public.feedback
FOR INSERT
TO public
WITH CHECK (true);

-- Allow authenticated staff to view feedback
CREATE POLICY "Allow authenticated reads on feedback"
ON public.feedback
FOR SELECT
TO authenticated
USING (true);

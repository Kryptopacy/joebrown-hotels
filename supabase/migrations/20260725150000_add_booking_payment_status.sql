-- Add payment_status to bookings table
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'unpaid';

-- Add guest_email and guests_count if missing (for manual bookings)
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS guest_email TEXT;

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS guests_count INT DEFAULT 1;

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS special_requests TEXT;

-- Index for faster payment status queries
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON public.bookings(payment_status);

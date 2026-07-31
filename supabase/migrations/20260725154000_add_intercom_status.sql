-- Add status column for lifecycle management
ALTER TABLE public.customer_intercom_messages
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';

CREATE INDEX IF NOT EXISTS idx_customer_intercom_messages_status ON public.customer_intercom_messages(status);

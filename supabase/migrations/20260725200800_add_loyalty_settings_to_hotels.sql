-- Add customizable loyalty rules to the hotels table
ALTER TABLE public.hotels
ADD COLUMN IF NOT EXISTS naira_per_loyalty_point INTEGER DEFAULT 1000,
ADD COLUMN IF NOT EXISTS loyalty_milestone_threshold INTEGER DEFAULT 5000;

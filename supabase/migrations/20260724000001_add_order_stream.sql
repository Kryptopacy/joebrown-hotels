-- Add stream column to orders to separate Restaurant vs Lounge
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS stream TEXT DEFAULT 'restaurant';

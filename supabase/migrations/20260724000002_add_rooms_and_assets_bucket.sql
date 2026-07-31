-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_id uuid REFERENCES hotels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  price_per_night NUMERIC(12,2) NOT NULL DEFAULT 0,
  max_guests INT DEFAULT 2,
  size_sqm INT,
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  is_available BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hotel_id, slug)
);

-- Enable RLS for rooms
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all rooms" ON rooms FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for rooms
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;

-- Create hotel-assets bucket (used for rooms, menu items, general branding)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('hotel-assets', 'hotel-assets', true) 
ON CONFLICT (id) DO NOTHING;

-- Allow public uploads to hotel-assets bucket
CREATE POLICY "Allow public uploads to hotel-assets" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'hotel-assets');

-- Allow public read of hotel-assets bucket
CREATE POLICY "Allow public read to hotel-assets" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'hotel-assets');

-- Allow public deletes to hotel-assets bucket
CREATE POLICY "Allow public deletes to hotel-assets" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'hotel-assets');

-- Allow public updates to hotel-assets bucket
CREATE POLICY "Allow public updates to hotel-assets" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'hotel-assets');

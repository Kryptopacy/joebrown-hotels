-- Create new storage buckets for the different areas of the hotel
-- based on the provided image folders

INSERT INTO storage.buckets (id, name, public) VALUES 
('exterior', 'exterior', true),
('gallery', 'gallery', true),
('lounge', 'lounge', true),
('others', 'others', true),
('reception', 'reception', true),
('restaurant', 'restaurant', true),
('rooftop', 'rooftop', true),
('rooms', 'rooms', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public uploads, reads, updates, and deletes for all these buckets
DO $$
DECLARE
  bucket_names text[] := ARRAY['exterior', 'gallery', 'lounge', 'others', 'reception', 'restaurant', 'rooftop', 'rooms'];
  bucket_name text;
BEGIN
  FOREACH bucket_name IN ARRAY bucket_names
  LOOP
    EXECUTE format('
      CREATE POLICY "Allow public uploads to %1$s" ON storage.objects FOR INSERT WITH CHECK (bucket_id = ''%1$s'');
      CREATE POLICY "Allow public read to %1$s" ON storage.objects FOR SELECT USING (bucket_id = ''%1$s'');
      CREATE POLICY "Allow public deletes to %1$s" ON storage.objects FOR DELETE USING (bucket_id = ''%1$s'');
      CREATE POLICY "Allow public updates to %1$s" ON storage.objects FOR UPDATE USING (bucket_id = ''%1$s'');
    ', bucket_name);
  END LOOP;
END;
$$;

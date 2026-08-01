DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'rooms' AND column_name = 'is_featured') THEN
    ALTER TABLE rooms ADD COLUMN is_featured BOOLEAN DEFAULT false;
  END IF;
END $$;
-- Set the first 3 rooms by display_order to be featured by default for backwards compatibility
UPDATE rooms
SET is_featured = true
WHERE id IN (
  SELECT id FROM rooms ORDER BY display_order ASC LIMIT 3
);

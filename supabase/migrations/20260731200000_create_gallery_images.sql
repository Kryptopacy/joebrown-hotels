-- Create gallery_images table so the business can manage gallery images
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  url text NOT NULL,
  title text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Public read (anyone can see active gallery images)
DROP POLICY IF EXISTS "gallery_public_read" ON public.gallery_images;
CREATE POLICY "gallery_public_read" ON public.gallery_images
  FOR SELECT USING (is_active = true);

-- Admin full access (use same email-based pattern as is_approved_staff())
DROP POLICY IF EXISTS "gallery_admin_all" ON public.gallery_images;
CREATE POLICY "gallery_admin_all" ON public.gallery_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.staff_users
      WHERE email = (SELECT auth.jwt()->>'email')
      AND role IN ('admin', 'manager', 'owner', 'dev')
      AND status = 'approved'
    )
  );

-- Seed with all images from /JB/gallery/
DO $$
DECLARE
  v_hotel_id uuid;
BEGIN
  SELECT id INTO v_hotel_id FROM public.hotels WHERE slug = 'joebrown' LIMIT 1;
  IF v_hotel_id IS NULL THEN RETURN; END IF;

  INSERT INTO public.gallery_images (hotel_id, url, title, display_order, is_active) VALUES
  (v_hotel_id, '/JB/gallery/jb_logo_badge.JPG', 'Joebrown Palace Hotel', 1, true),
  (v_hotel_id, '/JB/gallery/reception.JPG', 'Grand Reception', 2, true),
  (v_hotel_id, '/JB/gallery/reception_area_aesthetics.JPG', 'Reception Area', 3, true),
  (v_hotel_id, '/JB/gallery/reception_closeup.JPG', 'Reception Detail', 4, true),
  (v_hotel_id, '/JB/gallery/restaurant_brighter.JPG', 'Restaurant & Lounge', 5, true),
  (v_hotel_id, '/JB/gallery/restaurant.JPG', 'Dining Experience', 6, true),
  (v_hotel_id, '/JB/gallery/restaurant_aesthetics.JPG', 'Restaurant Ambiance', 7, true),
  (v_hotel_id, '/JB/gallery/restaurant_table.JPG', 'Table Setting', 8, true),
  (v_hotel_id, '/JB/gallery/restaurant_table_2.JPG', 'Fine Dining', 9, true),
  (v_hotel_id, '/JB/gallery/towel_monogram.JPG', 'Premium Amenities', 10, true),
  (v_hotel_id, '/JB/gallery/outsside_view_angle.JPG', 'Hotel Exterior', 11, true),
  (v_hotel_id, '/JB/gallery/P1160317.JPG', 'Hotel Interior', 12, true),
  (v_hotel_id, '/JB/gallery/P1160320.JPG', 'Hotel Spaces', 13, true),
  (v_hotel_id, '/JB/gallery/P1160321.JPG', 'Elegant Spaces', 14, true),
  (v_hotel_id, '/JB/gallery/P1160323.JPG', 'Refined Comfort', 15, true),
  (v_hotel_id, '/JB/gallery/P1160325.JPG', 'Premium Experience', 16, true),
  (v_hotel_id, '/JB/gallery/P1160327.JPG', 'Atmospheric Luxury', 17, true),
  (v_hotel_id, '/JB/gallery/P1160329.JPG', 'Beautiful Architecture', 18, true),
  (v_hotel_id, '/JB/gallery/P1160339.JPG', 'The Joebrown Experience', 19, true),
  (v_hotel_id, '/JB/gallery/P1160349.JPG', 'Bar & Lounge', 20, true),
  (v_hotel_id, '/JB/gallery/P1160356.JPG', 'Hotel Details', 21, true),
  (v_hotel_id, '/JB/gallery/P1160358.JPG', 'Scenic Views', 22, true),
  (v_hotel_id, '/JB/gallery/P1160360.JPG', 'Interior Design', 23, true),
  (v_hotel_id, '/JB/gallery/P1160363.JPG', 'Guest Comfort', 24, true),
  (v_hotel_id, '/JB/gallery/P1160365.JPG', 'Luxury Living', 25, true),
  (v_hotel_id, '/JB/gallery/P1160368.JPG', 'Refined Spaces', 26, false),
  (v_hotel_id, '/JB/gallery/P1160369.JPG', 'Hotel Ambiance', 27, false),
  (v_hotel_id, '/JB/gallery/P1160370.JPG', 'Premium Spaces', 28, false),
  (v_hotel_id, '/JB/gallery/P1160376.JPG', 'Distinctive Style', 29, false),
  (v_hotel_id, '/JB/gallery/P1160378.JPG', 'Elegant Interiors', 30, false),
  (v_hotel_id, '/JB/gallery/P1160382.JPG', 'The Estate', 31, false),
  (v_hotel_id, '/JB/gallery/P1160387.JPG', 'Hotel Views', 32, false),
  (v_hotel_id, '/JB/gallery/P1160388.JPG', 'Premium Amenities', 33, false),
  (v_hotel_id, '/JB/gallery/P1160393.JPG', 'Curated Spaces', 34, false),
  (v_hotel_id, '/JB/gallery/P1160394.JPG', 'Hotel Experience', 35, false),
  (v_hotel_id, '/JB/gallery/P1160396.JPG', 'Atmospheric Detail', 36, false),
  (v_hotel_id, '/JB/gallery/P1160400.JPG', 'Architectural Beauty', 37, false),
  (v_hotel_id, '/JB/gallery/P1160403.JPG', 'Scenic Hotel', 38, false),
  (v_hotel_id, '/JB/gallery/P1160410.JPG', 'Premier Accommodation', 39, false),
  (v_hotel_id, '/JB/gallery/P1160420.JPG', 'Refined Living', 40, false)
  ON CONFLICT DO NOTHING;
END;
$$;

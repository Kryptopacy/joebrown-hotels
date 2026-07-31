
DO $$
DECLARE
  h_id uuid;
BEGIN
  SELECT id INTO h_id FROM hotels WHERE slug = 'joebrown-palace-hotel-and-suites' LIMIT 1;
  IF h_id IS NULL THEN
    RAISE EXCEPTION 'Hotel not found';
  END IF;


  INSERT INTO public.rooms (hotel_id, name, slug, description, price_per_night, max_guests, size_sqm, amenities, images, is_available, display_order)
  VALUES (
    h_id, 
    'Standard Room', 
    'standard-room', 
    'A beautiful standard room featuring modern amenities and comfort.', 
    25000, 
    2, 
    35, 
    ARRAY['Air Conditioning', 'Free WiFi', 'Flat-screen TV', 'Ensuite Bathroom'], 
    ARRAY['/JB/rooms/room_type_1/IMG_20260401_155930.JPG', '/JB/rooms/room_type_1/IMG_20260401_160002.JPG', '/JB/rooms/room_type_1/IMG_20260401_160034.JPG', '/JB/rooms/room_type_1/IMG_20260401_160138.JPG', '/JB/rooms/room_type_1/IMG_20260401_160252.JPG', '/JB/rooms/room_type_1/IMG_20260401_160332.JPG', '/JB/rooms/room_type_1/IMG_20260401_160356.JPG', '/JB/rooms/room_type_1/IMG_20260401_160619.JPG', '/JB/rooms/room_type_1/IMG_20260401_160711.JPG', '/JB/rooms/room_type_1/IMG_20260401_160728.JPG', '/JB/rooms/room_type_1/IMG_20260401_161520.JPG', '/JB/rooms/room_type_1/P1160454.JPG'], 
    true, 
    1
  ) ON CONFLICT (hotel_id, slug) DO NOTHING;

  INSERT INTO public.rooms (hotel_id, name, slug, description, price_per_night, max_guests, size_sqm, amenities, images, is_available, display_order)
  VALUES (
    h_id, 
    'Deluxe Room', 
    'deluxe-room', 
    'A beautiful deluxe room featuring modern amenities and comfort.', 
    45000, 
    2, 
    35, 
    ARRAY['Air Conditioning', 'Free WiFi', 'Flat-screen TV', 'Ensuite Bathroom'], 
    ARRAY['/JB/rooms/room_type_2/IMG_20260401_163149.JPG', '/JB/rooms/room_type_2/IMG_20260401_163339.JPG', '/JB/rooms/room_type_2/IMG_20260401_163401.JPG', '/JB/rooms/room_type_2/IMG_20260401_163906.JPG', '/JB/rooms/room_type_2/IMG_20260401_164107.JPG', '/JB/rooms/room_type_2/IMG_20260401_164113.JPG'], 
    true, 
    2
  ) ON CONFLICT (hotel_id, slug) DO NOTHING;

  INSERT INTO public.rooms (hotel_id, name, slug, description, price_per_night, max_guests, size_sqm, amenities, images, is_available, display_order)
  VALUES (
    h_id, 
    'Executive Suite', 
    'executive-suite', 
    'A beautiful executive suite featuring modern amenities and comfort.', 
    75000, 
    2, 
    35, 
    ARRAY['Air Conditioning', 'Free WiFi', 'Flat-screen TV', 'Ensuite Bathroom'], 
    ARRAY['/JB/rooms/room_type_3/P1160463.JPG', '/JB/rooms/room_type_3/P1160464.JPG', '/JB/rooms/room_type_3/P1160465.JPG', '/JB/rooms/room_type_3/P1160472.JPG', '/JB/rooms/room_type_3/P1160475.JPG', '/JB/rooms/room_type_3/P1160477.JPG'], 
    true, 
    3
  ) ON CONFLICT (hotel_id, slug) DO NOTHING;

END;
$$;

DO $$
DECLARE
  h_id uuid;
  c_starters uuid;
  c_mains uuid;
  c_beers uuid;
  c_liquors uuid;
  c_wines uuid;
  c_cocktails uuid;
  c_softs uuid;
BEGIN
  -- Get hotel ID
  SELECT id INTO h_id FROM public.hotels WHERE slug = 'joebrown' LIMIT 1;
  IF h_id IS NULL THEN
    RETURN;
  END IF;

  -- Only seed if categories are completely empty for this hotel
  IF EXISTS (SELECT 1 FROM public.menu_categories WHERE hotel_id = h_id) THEN
    RETURN;
  END IF;

  -- Insert Categories
  INSERT INTO public.menu_categories (hotel_id, name, display_order, type) VALUES (h_id, 'Starters & Grills', 1, 'food') RETURNING id INTO c_starters;
  INSERT INTO public.menu_categories (hotel_id, name, display_order, type) VALUES (h_id, 'Main Dishes & Swallows', 2, 'food') RETURNING id INTO c_mains;
  INSERT INTO public.menu_categories (hotel_id, name, display_order, type) VALUES (h_id, 'Beers & Ciders', 3, 'drink') RETURNING id INTO c_beers;
  INSERT INTO public.menu_categories (hotel_id, name, display_order, type) VALUES (h_id, 'Liquors & Cognac', 4, 'drink') RETURNING id INTO c_liquors;
  INSERT INTO public.menu_categories (hotel_id, name, display_order, type) VALUES (h_id, 'Wines & Champagnes', 5, 'drink') RETURNING id INTO c_wines;
  INSERT INTO public.menu_categories (hotel_id, name, display_order, type) VALUES (h_id, 'Cocktails & Mocktails', 6, 'drink') RETURNING id INTO c_cocktails;
  INSERT INTO public.menu_categories (hotel_id, name, display_order, type) VALUES (h_id, 'Soft Drinks & Water', 7, 'drink') RETURNING id INTO c_softs;

  -- Insert Items
  INSERT INTO public.menu_items (hotel_id, category_id, name, price, display_order) VALUES (h_id, c_starters, 'Special Beef Suya Platter', 8500, 1);
  INSERT INTO public.menu_items (hotel_id, category_id, name, price, display_order) VALUES (h_id, c_starters, 'Grilled Croaker Fish & Chips', 18000, 2);
  INSERT INTO public.menu_items (hotel_id, category_id, name, price, display_order) VALUES (h_id, c_mains, 'Special Fried Rice & Chicken', 6500, 1);
  
  INSERT INTO public.menu_items (hotel_id, category_id, name, price, display_order) VALUES (h_id, c_beers, 'Heineken Ice Cold (330ml)', 2500, 1);
  INSERT INTO public.menu_items (hotel_id, category_id, name, price, display_order) VALUES (h_id, c_beers, 'Guinness Stout (Big Bottle)', 2500, 2);
  INSERT INTO public.menu_items (hotel_id, category_id, name, price, display_order) VALUES (h_id, c_beers, 'Trophy Lager Beer', 2000, 3);
  
  INSERT INTO public.menu_items (hotel_id, category_id, name, price, display_order) VALUES (h_id, c_liquors, 'Hennessy VSOP (Full Bottle)', 180000, 1);
  INSERT INTO public.menu_items (hotel_id, category_id, name, price, display_order) VALUES (h_id, c_liquors, 'Martell VS Cognac (Shot)', 8000, 2);
  
  INSERT INTO public.menu_items (hotel_id, category_id, name, price, display_order) VALUES (h_id, c_cocktails, 'Joebrown Special Cocktail', 6500, 1);
  INSERT INTO public.menu_items (hotel_id, category_id, name, price, display_order) VALUES (h_id, c_cocktails, 'Long Island Iced Tea', 7500, 2);
  
  INSERT INTO public.menu_items (hotel_id, category_id, name, price, display_order) VALUES (h_id, c_softs, 'Coca-Cola / Fanta / Sprite', 1000, 1);
  INSERT INTO public.menu_items (hotel_id, category_id, name, price, display_order) VALUES (h_id, c_softs, 'Eva Mineral Water (75cl)', 800, 2);

END $$;

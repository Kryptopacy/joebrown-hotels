-- Add 'type' column to menu_categories if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'menu_categories'
    AND column_name = 'type'
  ) THEN
    ALTER TABLE public.menu_categories ADD COLUMN type TEXT DEFAULT 'food';
  END IF;
END;
$$;

-- Seed menu categories and items from the JoeBrown PDF menu
DO $$
DECLARE
  v_hotel_id uuid;
  v_cat uuid;
BEGIN
  SELECT id INTO v_hotel_id FROM public.hotels WHERE slug = 'joebrown' LIMIT 1;
  IF v_hotel_id IS NULL THEN RETURN; END IF;

  -- Clear existing menu data for clean seed
  DELETE FROM public.menu_items WHERE hotel_id = v_hotel_id;
  DELETE FROM public.menu_categories WHERE hotel_id = v_hotel_id;

  -- ===================== FOOD CATEGORIES =====================

  INSERT INTO public.menu_categories (hotel_id, name, type, display_order) VALUES (v_hotel_id, 'Rice Dishes', 'food', 1) RETURNING id INTO v_cat;
  INSERT INTO public.menu_items (hotel_id, category_id, name, price, is_available, display_order) VALUES
    (v_hotel_id, v_cat, 'White Rice', 3000, true, 1),
    (v_hotel_id, v_cat, 'Fried Rice', 3500, true, 2),
    (v_hotel_id, v_cat, 'Jollof Rice', 3500, true, 3),
    (v_hotel_id, v_cat, 'Yam Porridge', 5000, true, 4),
    (v_hotel_id, v_cat, 'Coconut Rice', 5000, true, 5),
    (v_hotel_id, v_cat, 'Basmati Jollof Rice', 5000, true, 6),
    (v_hotel_id, v_cat, 'Village Rice', 5000, true, 7),
    (v_hotel_id, v_cat, 'Ofada Rice', 5000, true, 8),
    (v_hotel_id, v_cat, 'Suya Rice', 5000, true, 9),
    (v_hotel_id, v_cat, 'Chinese Rice', 7000, true, 10),
    (v_hotel_id, v_cat, 'Asun Rice', 7000, true, 11),
    (v_hotel_id, v_cat, 'Special Fried Rice', 15000, true, 12);

  INSERT INTO public.menu_categories (hotel_id, name, type, display_order) VALUES (v_hotel_id, 'Pasta Dishes', 'food', 2) RETURNING id INTO v_cat;
  INSERT INTO public.menu_items (hotel_id, category_id, name, price, is_available, display_order) VALUES
    (v_hotel_id, v_cat, 'Vegetable Noodles', 2000, true, 1),
    (v_hotel_id, v_cat, 'Jollof Spaghetti', 3000, true, 2),
    (v_hotel_id, v_cat, 'Stir Fry Spaghetti', 3000, true, 3),
    (v_hotel_id, v_cat, 'Singapore Noodles', 4000, true, 4),
    (v_hotel_id, v_cat, 'Alfredo Pasta', 7000, true, 5),
    (v_hotel_id, v_cat, 'Spaghetti Bolognese', 7000, true, 6);

  INSERT INTO public.menu_categories (hotel_id, name, type, display_order) VALUES (v_hotel_id, 'Sides & Fries', 'food', 3) RETURNING id INTO v_cat;
  INSERT INTO public.menu_items (hotel_id, category_id, name, price, is_available, display_order) VALUES
    (v_hotel_id, v_cat, 'Fried Yam', 2000, true, 1),
    (v_hotel_id, v_cat, 'Coleslaw', 2000, true, 2),
    (v_hotel_id, v_cat, 'Fries', 2000, true, 3),
    (v_hotel_id, v_cat, 'Plantain', 2000, true, 4),
    (v_hotel_id, v_cat, 'Salad', 3000, true, 5);

  INSERT INTO public.menu_categories (hotel_id, name, type, display_order) VALUES (v_hotel_id, 'Protein', 'food', 4) RETURNING id INTO v_cat;
  INSERT INTO public.menu_items (hotel_id, category_id, name, price, is_available, display_order) VALUES
    (v_hotel_id, v_cat, 'Boiled Egg', 1000, true, 1),
    (v_hotel_id, v_cat, 'Gizzard', 7000, true, 2),
    (v_hotel_id, v_cat, 'Beef', 7000, true, 3),
    (v_hotel_id, v_cat, 'Chicken', 8000, true, 4),
    (v_hotel_id, v_cat, 'Goat Meat', 8000, true, 5),
    (v_hotel_id, v_cat, 'Turkey', 10000, true, 6);

  INSERT INTO public.menu_categories (hotel_id, name, type, display_order) VALUES (v_hotel_id, 'Egg Choices', 'food', 5) RETURNING id INTO v_cat;
  INSERT INTO public.menu_items (hotel_id, category_id, name, price, is_available, display_order) VALUES
    (v_hotel_id, v_cat, 'Sunny Side Up', 2000, true, 1),
    (v_hotel_id, v_cat, 'Omelette', 2000, true, 2),
    (v_hotel_id, v_cat, 'Scrambled Eggs', 2000, true, 3),
    (v_hotel_id, v_cat, 'Egg Sauce', 2500, true, 4);

  INSERT INTO public.menu_categories (hotel_id, name, type, display_order) VALUES (v_hotel_id, 'Breakfast', 'food', 6) RETURNING id INTO v_cat;
  INSERT INTO public.menu_items (hotel_id, category_id, name, price, is_available, display_order) VALUES
    (v_hotel_id, v_cat, 'Boiled Yam & Egg Sauce', 5000, true, 1),
    (v_hotel_id, v_cat, 'Yamarita', 5000, true, 2),
    (v_hotel_id, v_cat, 'Classic French Toast', 5000, true, 3),
    (v_hotel_id, v_cat, 'Fluffy Pancakes', 5000, true, 4),
    (v_hotel_id, v_cat, 'Strawberry Pancakes', 5000, true, 5),
    (v_hotel_id, v_cat, 'Apple Cinnamon Pancakes', 5000, true, 6),
    (v_hotel_id, v_cat, 'Vegetable Sandwich', 5000, true, 7),
    (v_hotel_id, v_cat, 'Akara, Pap & Custard', 5000, true, 8),
    (v_hotel_id, v_cat, 'Boiled/Fried Plantain & Egg Sauce', 5000, true, 9),
    (v_hotel_id, v_cat, 'Joe Brown Classic Sandwich', 5000, true, 10),
    (v_hotel_id, v_cat, 'English Breakfast', 7000, true, 11);

  INSERT INTO public.menu_categories (hotel_id, name, type, display_order) VALUES (v_hotel_id, 'Grills & BBQ', 'food', 7) RETURNING id INTO v_cat;
  INSERT INTO public.menu_items (hotel_id, category_id, name, price, is_available, display_order) VALUES
    (v_hotel_id, v_cat, 'Catfish (Grilled)', 18000, true, 1),
    (v_hotel_id, v_cat, 'Croaker Fish (Large)', 14000, true, 2),
    (v_hotel_id, v_cat, 'Croaker Fish (Medium)', 12000, true, 3),
    (v_hotel_id, v_cat, 'BBQ Chicken (Full)', 15000, true, 4),
    (v_hotel_id, v_cat, 'Grilled Turkey', 10000, true, 5),
    (v_hotel_id, v_cat, 'Grill Chicken & Chips (Full)', 17000, true, 6),
    (v_hotel_id, v_cat, 'Chicken Vegetables', 17000, true, 7),
    (v_hotel_id, v_cat, 'BBQ Fish', 15000, true, 8);

  INSERT INTO public.menu_categories (hotel_id, name, type, display_order) VALUES (v_hotel_id, 'Pizza', 'food', 8) RETURNING id INTO v_cat;
  INSERT INTO public.menu_items (hotel_id, category_id, name, price, is_available, display_order) VALUES
    (v_hotel_id, v_cat, 'Chicken Pizza', 15000, true, 1),
    (v_hotel_id, v_cat, 'Mozzarella Pizza', 20000, true, 2),
    (v_hotel_id, v_cat, 'Joe Signature Pizza', 25000, true, 3);

  INSERT INTO public.menu_categories (hotel_id, name, type, display_order) VALUES (v_hotel_id, 'Burgers', 'food', 9) RETURNING id INTO v_cat;
  INSERT INTO public.menu_items (hotel_id, category_id, name, price, is_available, display_order) VALUES
    (v_hotel_id, v_cat, 'Beef Burger', 15000, true, 1),
    (v_hotel_id, v_cat, 'Chicken Wings & Fries', 15000, true, 2),
    (v_hotel_id, v_cat, 'Chicken Burger', 20000, true, 3);

  INSERT INTO public.menu_categories (hotel_id, name, type, display_order) VALUES (v_hotel_id, 'Swallow', 'food', 10) RETURNING id INTO v_cat;
  INSERT INTO public.menu_items (hotel_id, category_id, name, price, is_available, display_order) VALUES
    (v_hotel_id, v_cat, 'Eba', 3000, true, 1),
    (v_hotel_id, v_cat, 'Pounded Yam', 3500, true, 2),
    (v_hotel_id, v_cat, 'Semovita', 3500, true, 3);

  INSERT INTO public.menu_categories (hotel_id, name, type, display_order) VALUES (v_hotel_id, 'Soups', 'food', 11) RETURNING id INTO v_cat;
  INSERT INTO public.menu_items (hotel_id, category_id, name, price, is_available, display_order) VALUES
    (v_hotel_id, v_cat, 'Efo Riro', 3000, true, 1),
    (v_hotel_id, v_cat, 'Ogbono', 3000, true, 2),
    (v_hotel_id, v_cat, 'Afang', 3000, true, 3),
    (v_hotel_id, v_cat, 'Egusi', 3000, true, 4),
    (v_hotel_id, v_cat, 'Bitter Leaf', 3000, true, 5),
    (v_hotel_id, v_cat, 'Edika Ikong', 3000, true, 6),
    (v_hotel_id, v_cat, 'Vegetable Sauce', 3000, true, 7),
    (v_hotel_id, v_cat, 'Pepper Stew', 3000, true, 8);

  INSERT INTO public.menu_categories (hotel_id, name, type, display_order) VALUES (v_hotel_id, 'Pepper Soup', 'food', 12) RETURNING id INTO v_cat;
  INSERT INTO public.menu_items (hotel_id, category_id, name, price, is_available, display_order) VALUES
    (v_hotel_id, v_cat, 'Assorted (Cow)', 7000, true, 1),
    (v_hotel_id, v_cat, 'Goat Meat Pepper Soup', 9000, true, 2),
    (v_hotel_id, v_cat, 'Goat Meat Assorted', 9000, true, 3),
    (v_hotel_id, v_cat, 'Turkey Pepper Soup', 12000, true, 4),
    (v_hotel_id, v_cat, 'Croaker Pepper Soup', 15000, true, 5),
    (v_hotel_id, v_cat, 'Catfish Pepper Soup', 18000, true, 6);

  INSERT INTO public.menu_categories (hotel_id, name, type, display_order) VALUES (v_hotel_id, 'Platters', 'food', 13) RETURNING id INTO v_cat;
  INSERT INTO public.menu_items (hotel_id, category_id, name, price, is_available, display_order) VALUES
    (v_hotel_id, v_cat, 'Mini Platter (1 person)', 15000, true, 1),
    (v_hotel_id, v_cat, 'Joe Brown Single Platter (2–4 persons)', 25000, true, 2),
    (v_hotel_id, v_cat, 'Double Platter (4–6 persons)', 30000, true, 3);

  INSERT INTO public.menu_categories (hotel_id, name, type, display_order) VALUES (v_hotel_id, 'Shawarma & Specials', 'food', 14) RETURNING id INTO v_cat;
  INSERT INTO public.menu_items (hotel_id, category_id, name, price, is_available, display_order) VALUES
    (v_hotel_id, v_cat, 'Beef Shawarma (1 sausage)', 3000, true, 1),
    (v_hotel_id, v_cat, 'Beef Shawarma (2 sausages)', 3500, true, 2),
    (v_hotel_id, v_cat, 'Chicken Shawarma (1 sausage)', 3500, true, 3),
    (v_hotel_id, v_cat, 'Chicken Shawarma (2 sausages)', 4500, true, 4),
    (v_hotel_id, v_cat, 'Isi Ewu', 15000, true, 5),
    (v_hotel_id, v_cat, 'Nkwobi', 8000, true, 6),
    (v_hotel_id, v_cat, 'Assorted (Cold Cut)', 6000, true, 7);

  INSERT INTO public.menu_categories (hotel_id, name, type, display_order) VALUES (v_hotel_id, 'Finger Foods & Suya', 'food', 15) RETURNING id INTO v_cat;
  INSERT INTO public.menu_items (hotel_id, category_id, name, price, is_available, display_order) VALUES
    (v_hotel_id, v_cat, 'Suya (Jumbo)', 3000, true, 1),
    (v_hotel_id, v_cat, 'Suya (Regular)', 2000, true, 2),
    (v_hotel_id, v_cat, 'Suya (Small)', 1000, true, 3),
    (v_hotel_id, v_cat, 'Gizzard (Snack)', 1500, true, 4);

  -- ===================== DRINK CATEGORIES =====================

  INSERT INTO public.menu_categories (hotel_id, name, type, display_order) VALUES (v_hotel_id, 'Whisky & Spirits', 'drink', 1) RETURNING id INTO v_cat;
  INSERT INTO public.menu_items (hotel_id, category_id, name, price, is_available, display_order) VALUES
    (v_hotel_id, v_cat, 'Best Whisky (Big)', 17500, true, 1),
    (v_hotel_id, v_cat, 'Best Whisky (Small)', 4500, true, 2),
    (v_hotel_id, v_cat, 'Jameson Black Barrel', 63000, true, 3),
    (v_hotel_id, v_cat, 'Jameson', 40000, true, 4),
    (v_hotel_id, v_cat, 'Gordon''s Dry Gin (Big)', 17000, true, 5),
    (v_hotel_id, v_cat, 'Gordon''s Dry Gin (Small)', 4000, true, 6),
    (v_hotel_id, v_cat, 'Gordon''s Pink Gin', 4000, true, 7),
    (v_hotel_id, v_cat, 'Gordon''s Orange Gin', 4000, true, 8),
    (v_hotel_id, v_cat, 'Olmeca Tequila', 40000, true, 9);

  INSERT INTO public.menu_categories (hotel_id, name, type, display_order) VALUES (v_hotel_id, 'Wine', 'drink', 2) RETURNING id INTO v_cat;
  INSERT INTO public.menu_items (hotel_id, category_id, name, price, is_available, display_order) VALUES
    (v_hotel_id, v_cat, 'Four Cousins Rosé', 15000, true, 1),
    (v_hotel_id, v_cat, 'Four Cousins White', 15000, true, 2),
    (v_hotel_id, v_cat, 'Four Cousins Red', 15000, true, 3),
    (v_hotel_id, v_cat, 'Carlo Rossi', 15000, true, 4),
    (v_hotel_id, v_cat, 'Climmer Ice Rosé', 15000, true, 5),
    (v_hotel_id, v_cat, 'Fragolino Red', 20000, true, 6),
    (v_hotel_id, v_cat, 'Chiarelli Rosso', 20000, true, 7),
    (v_hotel_id, v_cat, 'Giacobazzi', 20000, true, 8);

  INSERT INTO public.menu_categories (hotel_id, name, type, display_order) VALUES (v_hotel_id, 'Cognac & Brandy', 'drink', 3) RETURNING id INTO v_cat;
  INSERT INTO public.menu_items (hotel_id, category_id, name, price, is_available, display_order) VALUES
    (v_hotel_id, v_cat, 'Martell VS', 80000, true, 1),
    (v_hotel_id, v_cat, 'Vecchia Romagna', 55000, true, 2),
    (v_hotel_id, v_cat, 'William Lawson''s', 25000, true, 3),
    (v_hotel_id, v_cat, '4th Street Red', 15000, true, 4);

  INSERT INTO public.menu_categories (hotel_id, name, type, display_order) VALUES (v_hotel_id, 'Vodka', 'drink', 4) RETURNING id INTO v_cat;
  INSERT INTO public.menu_items (hotel_id, category_id, name, price, is_available, display_order) VALUES
    (v_hotel_id, v_cat, 'Smirnoff (Big)', 17000, true, 1),
    (v_hotel_id, v_cat, 'Smirnoff (Small)', 5000, true, 2);

  INSERT INTO public.menu_categories (hotel_id, name, type, display_order) VALUES (v_hotel_id, 'Liqueur & Cream', 'drink', 5) RETURNING id INTO v_cat;
  INSERT INTO public.menu_items (hotel_id, category_id, name, price, is_available, display_order) VALUES
    (v_hotel_id, v_cat, 'Best Cream (Big)', 17000, true, 1),
    (v_hotel_id, v_cat, 'Best Cream (Small)', 5000, true, 2);

  INSERT INTO public.menu_categories (hotel_id, name, type, display_order) VALUES (v_hotel_id, 'Energy Drinks', 'drink', 6) RETURNING id INTO v_cat;
  INSERT INTO public.menu_items (hotel_id, category_id, name, price, is_available, display_order) VALUES
    (v_hotel_id, v_cat, 'Black Bullet', 4000, true, 1),
    (v_hotel_id, v_cat, 'Power Horse', 4000, true, 2);

  INSERT INTO public.menu_categories (hotel_id, name, type, display_order) VALUES (v_hotel_id, 'Bitters', 'drink', 7) RETURNING id INTO v_cat;
  INSERT INTO public.menu_items (hotel_id, category_id, name, price, is_available, display_order) VALUES
    (v_hotel_id, v_cat, 'Orijin Bitters (Big)', 17000, true, 1),
    (v_hotel_id, v_cat, 'Orijin Bitters (Can)', 4000, true, 2),
    (v_hotel_id, v_cat, 'Orijin Bitters (Small Plastic)', 2000, true, 3);

  INSERT INTO public.menu_categories (hotel_id, name, type, display_order) VALUES (v_hotel_id, 'Beers', 'drink', 8) RETURNING id INTO v_cat;
  INSERT INTO public.menu_items (hotel_id, category_id, name, price, is_available, display_order) VALUES
    (v_hotel_id, v_cat, 'Heineken (Big)', 2500, true, 1),
    (v_hotel_id, v_cat, 'Heineken (Small)', 2500, true, 2),
    (v_hotel_id, v_cat, 'Guinness Stout (Big)', 2500, true, 3),
    (v_hotel_id, v_cat, 'Guinness Stout (Medium)', 2500, true, 4),
    (v_hotel_id, v_cat, 'Star', 1500, true, 5),
    (v_hotel_id, v_cat, 'Flying Fish', 1500, true, 6),
    (v_hotel_id, v_cat, 'Hero', 1500, true, 7),
    (v_hotel_id, v_cat, 'Budweiser', 1500, true, 8),
    (v_hotel_id, v_cat, 'Goldberg', 1500, true, 9),
    (v_hotel_id, v_cat, 'Goldberg Black', 2000, true, 10),
    (v_hotel_id, v_cat, 'Turbo King', 1500, true, 11),
    (v_hotel_id, v_cat, 'Legend', 2000, true, 12),
    (v_hotel_id, v_cat, 'Gulder', 1500, true, 13),
    (v_hotel_id, v_cat, 'Trophy', 1500, true, 14),
    (v_hotel_id, v_cat, 'Trophy Black', 1500, true, 15),
    (v_hotel_id, v_cat, '33 Export', 1500, true, 16),
    (v_hotel_id, v_cat, 'Desperados', 1500, true, 17),
    (v_hotel_id, v_cat, 'Castle Lite', 1500, true, 18),
    (v_hotel_id, v_cat, 'Orijin (Beer)', 1500, true, 19);

  INSERT INTO public.menu_categories (hotel_id, name, type, display_order) VALUES (v_hotel_id, 'Soft Drinks & Juices', 'drink', 9) RETURNING id INTO v_cat;
  INSERT INTO public.menu_items (hotel_id, category_id, name, price, is_available, display_order) VALUES
    (v_hotel_id, v_cat, 'Coca-Cola', 1000, true, 1),
    (v_hotel_id, v_cat, 'Fayrouz (Bottle)', 1000, true, 2),
    (v_hotel_id, v_cat, 'Fayrouz (Can)', 1000, true, 3),
    (v_hotel_id, v_cat, 'Amstel Malt', 1000, true, 4),
    (v_hotel_id, v_cat, 'Maltina', 1000, true, 5),
    (v_hotel_id, v_cat, 'Malta Guinness', 1000, true, 6),
    (v_hotel_id, v_cat, 'Chivita Orange', 4000, true, 7),
    (v_hotel_id, v_cat, 'Chivita Exotic', 4000, true, 8),
    (v_hotel_id, v_cat, 'Chivita Active', 4000, true, 9),
    (v_hotel_id, v_cat, 'Hollandia Yoghurt', 4000, true, 10),
    (v_hotel_id, v_cat, 'Water', 500, true, 11);

END;
$$;

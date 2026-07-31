-- Core tables
CREATE TABLE IF NOT EXISTS hotels (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  brand_color_primary TEXT DEFAULT '#F59E0B',
  hero_image_url TEXT,
  logo_url TEXT,
  whatsapp_number TEXT,
  bank_name TEXT DEFAULT 'First Bank Nigeria',
  bank_account_number TEXT DEFAULT '0123456789',
  bank_account_name TEXT DEFAULT 'Joebrown Palace Hotel and Suites',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_id uuid REFERENCES hotels(id) ON DELETE CASCADE,
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL,
  UNIQUE(hotel_id, setting_key)
);

CREATE TABLE IF NOT EXISTS menu_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_id uuid REFERENCES hotels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS menu_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_id uuid REFERENCES hotels(id) ON DELETE CASCADE,
  category_id uuid REFERENCES menu_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  hotel_id uuid REFERENCES hotels(id),
  order_number TEXT UNIQUE NOT NULL DEFAULT ('ORD-' || UPPER(SUBSTRING(gen_random_uuid()::text, 1, 8))),
  guest_name TEXT NOT NULL,
  room_or_table TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  payment_method TEXT DEFAULT 'bank_transfer',
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_screenshot_url TEXT,
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  item_price NUMERIC(12,2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1
);

-- Initial Hotel Data
INSERT INTO hotels (slug, name, tagline, description, brand_color_primary)
VALUES (
  'joebrown', 
  'Joebrown Palace Hotel and Suites', 
  'A Sanctuary of Refined Hospitality & Timeless Luxury',
  'Experience curated comfort, gourmet dining, and bespoke concierge hospitality at Joebrown Palace Hotel and Suites.',
  '#D4A373'
) ON CONFLICT (slug) DO NOTHING;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE menu_categories;

-- Enable RLS - open policies for now
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all hotels" ON hotels FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all site_settings" ON site_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all menu_categories" ON menu_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all menu_items" ON menu_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all order_items" ON order_items FOR ALL USING (true) WITH CHECK (true);

-- Create payment-screenshots bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-screenshots', 'payment-screenshots', true) 
ON CONFLICT (id) DO NOTHING;

-- Allow public uploads to bucket
CREATE POLICY "Allow public uploads to payment-screenshots" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'payment-screenshots');

-- Allow public read of bucket
CREATE POLICY "Allow public read to payment-screenshots" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'payment-screenshots');

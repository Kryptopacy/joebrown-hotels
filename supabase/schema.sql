-- Supabase Initial Schema & RLS Policies for Dreamfield

-- Hotels (Multi-tenant)
CREATE TABLE IF NOT EXISTS hotels (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text UNIQUE NOT NULL,
    name text NOT NULL,
    tagline text,
    description text,
    whatsapp_number text,
    address text,
    brand_color_primary text DEFAULT '#C9A84C',
    brand_color_secondary text DEFAULT '#1A1A1A',
    logo_url text,
    hero_image_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Site Settings (KV Store)
CREATE TABLE IF NOT EXISTS site_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id uuid REFERENCES hotels(id) ON DELETE CASCADE NOT NULL,
    setting_key text NOT NULL,
    setting_value jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(hotel_id, setting_key)
);

-- Rooms
CREATE TABLE IF NOT EXISTS rooms (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id uuid REFERENCES hotels(id) ON DELETE CASCADE NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    description text,
    price_per_night numeric NOT NULL,
    max_guests integer DEFAULT 2,
    size_sqm integer,
    amenities jsonb DEFAULT '[]'::jsonb,
    images jsonb DEFAULT '[]'::jsonb,
    is_available boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(hotel_id, slug)
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id uuid REFERENCES hotels(id) ON DELETE CASCADE NOT NULL,
    room_id uuid REFERENCES rooms(id) ON DELETE SET NULL,
    guest_name text NOT NULL,
    guest_email text,
    guest_phone text NOT NULL,
    check_in date NOT NULL,
    check_out date NOT NULL,
    guests_count integer DEFAULT 1,
    total_price numeric NOT NULL,
    status text DEFAULT 'pending', -- pending, confirmed, checked_in, completed, cancelled
    special_requests text,
    created_at timestamp with time zone DEFAULT now()
);

-- Menu Categories
CREATE TABLE IF NOT EXISTS menu_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id uuid REFERENCES hotels(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    type text NOT NULL, -- 'food' or 'drink'
    icon text,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id uuid REFERENCES hotels(id) ON DELETE CASCADE NOT NULL,
    category_id uuid REFERENCES menu_categories(id) ON DELETE RESTRICT NOT NULL,
    name text NOT NULL,
    description text,
    price numeric NOT NULL,
    image_url text,
    tags jsonb DEFAULT '[]'::jsonb, -- e.g. ["vegan", "spicy"]
    is_available boolean DEFAULT true,
    is_featured boolean DEFAULT false,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

-- Tables / QR Codes
CREATE TABLE IF NOT EXISTS tables_config (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id uuid REFERENCES hotels(id) ON DELETE CASCADE NOT NULL,
    table_number text NOT NULL,
    section_name text,
    qr_url text,
    created_at timestamp with time zone DEFAULT now()
);

-- Row Level Security (RLS) Enable
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables_config ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON hotels;
DROP POLICY IF EXISTS "Admin update access to hotels" ON hotels;
DROP POLICY IF EXISTS "Public settings are viewable by everyone." ON site_settings;
DROP POLICY IF EXISTS "Admin full access to site_settings" ON site_settings;
DROP POLICY IF EXISTS "Available rooms are viewable by everyone." ON rooms;
DROP POLICY IF EXISTS "Admin full access to rooms" ON rooms;
DROP POLICY IF EXISTS "Active categories are viewable by everyone." ON menu_categories;
DROP POLICY IF EXISTS "Admin full access to menu_categories" ON menu_categories;
DROP POLICY IF EXISTS "Menu items are viewable by everyone." ON menu_items;
DROP POLICY IF EXISTS "Admin full access to menu_items" ON menu_items;
DROP POLICY IF EXISTS "Anyone can create a booking" ON bookings;
DROP POLICY IF EXISTS "Admin full access to bookings" ON bookings;
DROP POLICY IF EXISTS "Public view tables_config" ON tables_config;
DROP POLICY IF EXISTS "Admin full access to tables_config" ON tables_config;

-- Helper function for Admin/Staff Auth
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.staff_profiles
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hotels Policies
CREATE POLICY "Public profiles are viewable by everyone." ON hotels FOR SELECT USING (true);
CREATE POLICY "Admin update access to hotels" ON hotels FOR ALL USING (public.is_staff());

-- Site Settings Policies
CREATE POLICY "Public settings are viewable by everyone." ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admin full access to site_settings" ON site_settings FOR ALL USING (public.is_staff());

-- Rooms Policies
CREATE POLICY "Available rooms are viewable by everyone." ON rooms FOR SELECT USING (is_available = true OR auth.role() = 'authenticated');
CREATE POLICY "Admin full access to rooms" ON rooms FOR ALL USING (public.is_staff());

-- Menu Categories Policies
CREATE POLICY "Active categories are viewable by everyone." ON menu_categories FOR SELECT USING (is_active = true OR auth.role() = 'authenticated');
CREATE POLICY "Admin full access to menu_categories" ON menu_categories FOR ALL USING (public.is_staff());

-- Menu Items Policies
CREATE POLICY "Menu items are viewable by everyone." ON menu_items FOR SELECT USING (true);
CREATE POLICY "Admin full access to menu_items" ON menu_items FOR ALL USING (public.is_staff());

-- Bookings Policies
CREATE POLICY "Anyone can create a booking" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access to bookings" ON bookings FOR ALL USING (public.is_staff());

-- Tables Config Policies
CREATE POLICY "Public view tables_config" ON tables_config FOR SELECT USING (true);
CREATE POLICY "Admin full access to tables_config" ON tables_config FOR ALL USING (public.is_staff());

-- --------------------------------------------------------
-- STAFF ROLES & INTERCOM SYSTEM
-- --------------------------------------------------------

-- Staff Profiles (Role-Based Access Control)
CREATE TABLE IF NOT EXISTS staff_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid UNIQUE,
    full_name text NOT NULL,
    email text UNIQUE NOT NULL,
    role text NOT NULL DEFAULT 'receptionist', -- 'super_admin', 'receptionist', 'kitchen_staff', 'housekeeping'
    department text NOT NULL DEFAULT 'Front Desk',
    phone text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);

-- Customer-to-Business Intercom Messages
CREATE TABLE IF NOT EXISTS customer_intercom_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id uuid REFERENCES hotels(id) ON DELETE CASCADE NOT NULL,
    session_id text NOT NULL,
    guest_name text DEFAULT 'Guest',
    room_or_table text,
    sender_type text NOT NULL, -- 'guest' or 'staff'
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- Staff Internal Intercom Messages
CREATE TABLE IF NOT EXISTS staff_intercom_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id uuid REFERENCES hotels(id) ON DELETE CASCADE NOT NULL,
    sender_name text NOT NULL,
    sender_role text NOT NULL,
    department text NOT NULL DEFAULT 'all', -- 'all', 'front_desk', 'kitchen', 'housekeeping'
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS for Intercom and Staff Profiles
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_intercom_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_intercom_messages ENABLE ROW LEVEL SECURITY;

-- Staff Profiles Policies
DROP POLICY IF EXISTS "Staff profiles viewable by authenticated" ON staff_profiles;
DROP POLICY IF EXISTS "Super Admin edit staff profiles" ON staff_profiles;
CREATE POLICY "Staff profiles viewable by authenticated" ON staff_profiles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Super Admin edit staff profiles" ON staff_profiles FOR ALL USING (public.is_staff());

-- Customer Intercom Policies
DROP POLICY IF EXISTS "Anyone can insert customer intercom message" ON customer_intercom_messages;
DROP POLICY IF EXISTS "Public select own session customer intercom" ON customer_intercom_messages;
DROP POLICY IF EXISTS "Admin full access to customer intercom" ON customer_intercom_messages;
CREATE POLICY "Anyone can insert customer intercom message" ON customer_intercom_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public select own session customer intercom" ON customer_intercom_messages FOR SELECT USING (true);
CREATE POLICY "Admin full access to customer intercom" ON customer_intercom_messages FOR ALL USING (public.is_staff());

-- Staff Intercom Policies
DROP POLICY IF EXISTS "Authenticated staff access staff intercom" ON staff_intercom_messages;
CREATE POLICY "Authenticated staff access staff intercom" ON staff_intercom_messages FOR ALL USING (public.is_staff());

-- STORAGE CONFIGURATION
INSERT INTO storage.buckets (id, name, public) 
VALUES ('hotel-assets', 'hotel-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
DROP POLICY IF EXISTS "Public read access to hotel assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload access to hotel assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin update access to hotel assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete access to hotel assets" ON storage.objects;

CREATE POLICY "Public read access to hotel assets"
ON storage.objects FOR SELECT USING (bucket_id = 'hotel-assets');

CREATE POLICY "Admin upload access to hotel assets"
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'hotel-assets' AND public.is_staff());

CREATE POLICY "Admin update access to hotel assets"
ON storage.objects FOR UPDATE USING (bucket_id = 'hotel-assets' AND public.is_staff());

CREATE POLICY "Admin delete access to hotel assets"
ON storage.objects FOR DELETE USING (bucket_id = 'hotel-assets' AND public.is_staff());




-- ShareBite Supabase Database Migration Script
-- Safe to execute on a fresh Supabase project

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. PROFILES TABLE ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('donor', 'receiver', 'volunteer', 'ngo', 'partner', 'admin')) DEFAULT 'donor',
  bio TEXT,
  address TEXT,
  city TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── 2. PARTNERS TABLE ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_name TEXT NOT NULL,
  organization_type TEXT CHECK (organization_type IN ('restaurant', 'hostel', 'NGO', 'community_kitchen', 'farmer', 'organization', 'other')) DEFAULT 'restaurant',
  description TEXT,
  address TEXT,
  city TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  logo_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── 3. FOOD LISTINGS TABLE ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.food_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('Biryani', 'Rice', 'Roti', 'Curry', 'Vegetables', 'Bakery', 'Fruits', 'Packaged Food', 'Other')) NOT NULL,
  servings INTEGER NOT NULL CHECK (servings >= 0),
  available_servings INTEGER NOT NULL CHECK (available_servings >= 0),
  image_url TEXT,
  pickup_address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  available_from TIMESTAMPTZ DEFAULT now(),
  available_until TIMESTAMPTZ NOT NULL,
  status TEXT CHECK (status IN ('AVAILABLE', 'RESERVED', 'PARTIALLY_RESERVED', 'PICKED_UP', 'COMPLETED', 'EXPIRED', 'CANCELLED')) DEFAULT 'AVAILABLE',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── 4. RESERVATIONS TABLE ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_listing_id UUID REFERENCES public.food_listings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  servings INTEGER NOT NULL CHECK (servings > 0),
  status TEXT CHECK (status IN ('PENDING', 'CONFIRMED', 'PICKED_UP', 'COMPLETED', 'CANCELLED', 'EXPIRED')) DEFAULT 'PENDING',
  pickup_time TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── 5. DONATIONS TABLE ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  food_listing_id UUID REFERENCES public.food_listings(id) ON DELETE SET NULL,
  donor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  servings INTEGER NOT NULL CHECK (servings >= 0),
  status TEXT CHECK (status IN ('AVAILABLE', 'CLAIMED', 'PICKUP_CONFIRMED', 'PICKED_UP', 'COMPLETED', 'CANCELLED', 'EXPIRED')) DEFAULT 'AVAILABLE',
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- ── 6. NOTIFICATIONS TABLE ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('RESERVATION_CREATED', 'RESERVATION_CONFIRMED', 'PICKUP_READY', 'PICKUP_COMPLETED', 'DONATION_CREATED', 'DONATION_COMPLETED', 'PARTNER_VERIFIED', 'SYSTEM')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_food_id UUID REFERENCES public.food_listings(id) ON DELETE SET NULL,
  related_reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 7. INDEXES FOR PERFORMANCE ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_food_listings_status ON public.food_listings(status);
CREATE INDEX IF NOT EXISTS idx_food_listings_donor_id ON public.food_listings(donor_id);
CREATE INDEX IF NOT EXISTS idx_food_listings_created_at ON public.food_listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_food_listings_available_until ON public.food_listings(available_until);
CREATE INDEX IF NOT EXISTS idx_food_listings_lat_long ON public.food_listings(latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON public.reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_food_listing_id ON public.reservations(food_listing_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON public.reservations(status);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_partners_city ON public.partners(city);

-- ── 8. UPDATED_AT TRIGGER FUNCTION ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE OR REPLACE TRIGGER trg_update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER trg_update_partners_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER trg_update_food_listings_updated_at
  BEFORE UPDATE ON public.food_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER trg_update_reservations_updated_at
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── 9. AUTH SIGNUP TRIGGER ──────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_role TEXT;
  v_org_name TEXT;
BEGIN
  v_role := COALESCE(new.raw_user_meta_data->>'role', 'donor');
  v_org_name := new.raw_user_meta_data->>'organizationName';

  INSERT INTO public.profiles (id, full_name, email, phone, role, is_verified)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', 'Anonymous User'),
    new.email,
    COALESCE(new.phone, new.raw_user_meta_data->>'phone', ''),
    v_role,
    false
  );

  IF v_role = 'ngo' AND v_org_name IS NOT NULL THEN
    INSERT INTO public.partners (profile_id, organization_name, organization_type, is_verified)
    VALUES (new.id, v_org_name, 'NGO', false);
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── 10. TRANSACTIONAL RESERVATION RPC ───────────────────────────────────────
CREATE OR REPLACE FUNCTION reserve_food_servings(
  p_food_listing_id UUID,
  p_user_id UUID,
  p_servings INT,
  p_pickup_time TIMESTAMPTZ,
  p_notes TEXT
) RETURNS UUID AS $$
DECLARE
  v_available_servings INT;
  v_status TEXT;
  v_expires_at TIMESTAMPTZ;
  v_reservation_id UUID;
  v_donor_id UUID;
  v_food_title TEXT;
BEGIN
  -- Lock listing record
  SELECT available_servings, status, available_until, donor_id, title 
  INTO v_available_servings, v_status, v_expires_at, v_donor_id, v_food_title
  FROM public.food_listings 
  WHERE id = p_food_listing_id 
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Food listing not found';
  END IF;

  IF v_donor_id = p_user_id THEN
    RAISE EXCEPTION 'Donors cannot reserve their own listing';
  END IF;

  IF v_status NOT IN ('AVAILABLE', 'PARTIALLY_RESERVED') THEN
    RAISE EXCEPTION 'Food listing is no longer available';
  END IF;

  IF v_expires_at < now() THEN
    RAISE EXCEPTION 'Food listing has expired';
  END IF;

  IF p_servings <= 0 THEN
    RAISE EXCEPTION 'Requested servings must be greater than 0';
  END IF;

  IF v_available_servings < p_servings THEN
    RAISE EXCEPTION 'Not enough servings available';
  END IF;

  -- Create reservation
  INSERT INTO public.reservations (food_listing_id, user_id, servings, status, pickup_time, notes)
  VALUES (p_food_listing_id, p_user_id, p_servings, 'PENDING', p_pickup_time, p_notes)
  RETURNING id INTO v_reservation_id;

  -- Update available servings and listing status
  UPDATE public.food_listings
  SET available_servings = available_servings - p_servings,
      status = CASE 
        WHEN available_servings - p_servings = 0 THEN 'RESERVED'
        ELSE 'PARTIALLY_RESERVED'
      END,
      updated_at = now()
  WHERE id = p_food_listing_id;

  -- Create notification for the donor
  INSERT INTO public.notifications (user_id, type, title, message, related_food_id, related_reservation_id)
  VALUES (
    v_donor_id, 
    'RESERVATION_CREATED', 
    'New Reservation Request', 
    'Someone has requested to reserve ' || p_servings || ' servings of ' || v_food_title || '.', 
    p_food_listing_id, 
    v_reservation_id
  );

  RETURN v_reservation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 11. ROW LEVEL SECURITY (RLS) policies ───────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Allow public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Partners Policies
CREATE POLICY "Allow public read partners" ON public.partners FOR SELECT USING (true);
CREATE POLICY "Allow owners update partners" ON public.partners FOR UPDATE USING (auth.uid() = profile_id);
CREATE POLICY "Allow owners insert partners" ON public.partners FOR INSERT WITH CHECK (auth.uid() = profile_id);

-- Food Listings Policies
CREATE POLICY "Allow public read active food listings" ON public.food_listings FOR SELECT USING (true);
CREATE POLICY "Allow donors insert own listings" ON public.food_listings FOR INSERT WITH CHECK (auth.uid() = donor_id);
CREATE POLICY "Allow donors update own listings" ON public.food_listings FOR UPDATE USING (auth.uid() = donor_id);
CREATE POLICY "Allow donors delete own listings" ON public.food_listings FOR DELETE USING (auth.uid() = donor_id);

-- Reservations Policies
CREATE POLICY "Allow users view own reservations" ON public.reservations FOR SELECT USING (
  auth.uid() = user_id OR 
  auth.uid() = (SELECT donor_id FROM public.food_listings WHERE id = food_listing_id)
);
CREATE POLICY "Allow users insert own reservations" ON public.reservations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow participants update reservation" ON public.reservations FOR UPDATE USING (
  auth.uid() = user_id OR 
  auth.uid() = (SELECT donor_id FROM public.food_listings WHERE id = food_listing_id)
);

-- Donations Policies
CREATE POLICY "Allow donors view own donations" ON public.donations FOR SELECT USING (auth.uid() = donor_id);
CREATE POLICY "Allow donors insert own donations" ON public.donations FOR INSERT WITH CHECK (auth.uid() = donor_id);
CREATE POLICY "Allow donors update own donations" ON public.donations FOR UPDATE USING (auth.uid() = donor_id);

-- Notifications Policies
CREATE POLICY "Allow users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- ── 12. STORAGE BUCKETS SETUP ──────────────────────────────────────────────
-- Create buckets if they do not exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('food-images', 'food-images', true) 
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true) 
ON CONFLICT (id) DO NOTHING;

-- Storage Security Policies
CREATE POLICY "Allow public select food-images" 
  ON storage.objects FOR SELECT USING (bucket_id = 'food-images');

CREATE POLICY "Allow auth insert food-images" 
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'food-images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow public select avatars" 
  ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Allow auth insert avatars" 
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

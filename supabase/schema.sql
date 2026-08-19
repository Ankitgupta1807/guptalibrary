-- ============================================================================
-- GUPTA LIBRARY - SUPABASE POSTGRESQL COMPLETE SCHEMA & CLEANUP
-- Location: Sasamusa, Gopalganj, Bihar - 841505
-- Email: guptalibraryy@gmail.com
-- ============================================================================

-- 1. Drop ALL conflicting triggers from auth.users
DO $$
DECLARE
    trg_record RECORD;
BEGIN
    FOR trg_record IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_schema = 'auth' AND event_object_table = 'users'
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(trg_record.trigger_name) || ' ON auth.users CASCADE;';
    END LOOP;
END $$;

-- Drop legacy trigger functions
DROP FUNCTION IF EXISTS public.handle_new_auth_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_auth_user() CASCADE;
DROP FUNCTION IF EXISTS public.on_auth_user_created() CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.sync_user_profile() CASCADE;

-- 2. Create Admin Users Table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID
);

-- 3. Pre-Authorize Master Admin Emails
INSERT INTO public.admin_users (name, email, role)
VALUES 
  ('Ankit Gupta', 'admin@guptalibrary.com', 'admin'),
  ('Ankit Gupta', 'guptaankit8789@gmail.com', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- 4. Helper Function: is_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public, auth
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE email = lower(auth.jwt()->>'email') OR user_id = auth.uid()
    );
$$;

-- 5. Create Main Library Tables
CREATE TABLE IF NOT EXISTS public.seats (
    id VARCHAR(50) PRIMARY KEY,
    hall VARCHAR(100) NOT NULL,
    type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Vacant',
    student_id VARCHAR(50),
    student_name VARCHAR(255),
    shift VARCHAR(100),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.members (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    gender VARCHAR(20),
    address TEXT,
    exam_target VARCHAR(255),
    seat_id VARCHAR(50),
    hall VARCHAR(100),
    shift VARCHAR(100),
    monthly_fee NUMERIC(10,2) DEFAULT 500,
    joining_date DATE,
    valid_till DATE,
    status VARCHAR(50) DEFAULT 'Active',
    dues NUMERIC(10,2) DEFAULT 0,
    avatar_color VARCHAR(50),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transactions (
    receipt_no VARCHAR(50) PRIMARY KEY,
    student_id VARCHAR(50),
    student_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    seat_id VARCHAR(50),
    shift VARCHAR(100),
    amount NUMERIC(10,2) NOT NULL,
    payment_mode VARCHAR(100) NOT NULL,
    payment_date DATE NOT NULL,
    payment_time VARCHAR(50),
    period VARCHAR(100),
    collected_by VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Paid',
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.books (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    isbn VARCHAR(100),
    shelf VARCHAR(100),
    total_copies INT DEFAULT 1,
    available_copies INT DEFAULT 1,
    status VARCHAR(50) DEFAULT 'Available',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.library_settings (
    id INT PRIMARY KEY DEFAULT 1,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    currency VARCHAR(10) DEFAULT '₹',
    monthly_plan_fullday NUMERIC(10,2) DEFAULT 800,
    monthly_plan_shift NUMERIC(10,2) DEFAULT 500,
    receipt_footer_note TEXT
);

-- Insert default library settings if missing
INSERT INTO public.library_settings (id, name, address, email, phone, monthly_plan_fullday, monthly_plan_shift, receipt_footer_note)
VALUES (1, 'Gupta Library', 'Sasamusa, Gopalganj, Bihar - 841505', 'guptalibraryy@gmail.com', '+91 94312 88990', 800, 500, 'Thank you for studying at Gupta Library. Silence is required in reading halls.')
ON CONFLICT (id) DO NOTHING;

-- 6. Row Level Security
ALTER TABLE public.library_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Drop all old policies
DROP POLICY IF EXISTS "Admin only library_settings" ON public.library_settings;
DROP POLICY IF EXISTS "Admin only seats" ON public.seats;
DROP POLICY IF EXISTS "Admin only members" ON public.members;
DROP POLICY IF EXISTS "Admin only transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admin only books" ON public.books;
DROP POLICY IF EXISTS "Admin only admin_users" ON public.admin_users;

-- Admin-Only RLS Policies
CREATE POLICY "Admin only library_settings" ON public.library_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin only seats" ON public.seats FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin only members" ON public.members FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin only transactions" ON public.transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin only books" ON public.books FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin only admin_users" ON public.admin_users FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. Seed 94 Seats (Ground Floor: G1-G44, First Floor: A1-A50)
DO $$
DECLARE
    i INT;
    seat_id VARCHAR(50);
    seat_type VARCHAR(100);
BEGIN
    -- Remove any legacy seats that are not part of 94 seats
    DELETE FROM public.seats WHERE id NOT LIKE 'G%' AND id NOT LIKE 'A%';

    -- Ground Floor: 44 Seats (G1 to G44)
    FOR i IN 1..44 LOOP
        seat_id := 'G' || i;
        IF i <= 14 THEN
            seat_type := 'Cabin Seat';
        ELSIF i >= 36 THEN
            seat_type := 'Quiet Corner';
        ELSE
            seat_type := 'Standard Desk';
        END IF;
        
        INSERT INTO public.seats (id, hall, type, status)
        VALUES (seat_id, 'Ground Floor', seat_type, 'Vacant')
        ON CONFLICT (id) DO UPDATE SET hall = 'Ground Floor', type = seat_type;
    END LOOP;

    -- First Floor: 50 Seats (A1 to A50)
    FOR i IN 1..50 LOOP
        seat_id := 'A' || i;
        IF i <= 16 THEN
            seat_type := 'Cabin Seat';
        ELSIF i >= 40 THEN
            seat_type := 'Quiet Corner';
        ELSE
            seat_type := 'Standard Desk';
        END IF;
        
        INSERT INTO public.seats (id, hall, type, status)
        VALUES (seat_id, 'First Floor', seat_type, 'Vacant')
        ON CONFLICT (id) DO UPDATE SET hall = 'First Floor', type = seat_type;
    END LOOP;
END $$;

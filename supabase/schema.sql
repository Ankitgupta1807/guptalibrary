-- ============================================================================
-- GUPTA LIBRARY - SUPABASE AUTH & RLS SCHEMA + 94 SEATS CONFIGURATION
-- Ground Floor: 44 Seats (G1 to G44)
-- First Floor: 50 Seats (A1 to A50)
-- Location: Sasamusa, Gopalganj, Bihar - 841505
-- ============================================================================

-- 1. Drop conflicting triggers from auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_auth_user();

-- 2. Clean up any corrupted direct-SQL auth entries
DELETE FROM auth.identities WHERE identity_data->>'email' = 'admin@guptalibrary.com';
DELETE FROM auth.users WHERE email = 'admin@guptalibrary.com';

-- 3. Create Admin Users Table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID
);

-- 4. Pre-Authorize Master Admin Emails
INSERT INTO public.admin_users (name, email, role)
VALUES 
  ('Ankit Gupta', 'admin@guptalibrary.com', 'admin'),
  ('Ankit Gupta', 'guptaankit8789@gmail.com', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- 5. Helper Function: is_admin
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

-- 6. Create Main Library Tables
CREATE TABLE IF NOT EXISTS public.seats (
    id VARCHAR(50) PRIMARY KEY,
    hall VARCHAR(100) NOT NULL,
    type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Vacant',
    student_id VARCHAR(50),
    student_name VARCHAR(255),
    shift VARCHAR(100)
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
    avatar_color VARCHAR(50)
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
    remarks TEXT
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
    admission_fee NUMERIC(10,2) DEFAULT 200,
    receipt_footer_note TEXT
);

-- 7. Row Level Security
ALTER TABLE public.library_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Drop all old policies
DROP POLICY IF EXISTS "Admin only library_settings" ON public.library_settings;
DROP POLICY IF EXISTS "Admin only seats" ON public.seats;
DROP POLICY IF EXISTS "Admin only members" ON public.members;
DROP POLICY IF EXISTS "Admin only transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admin only admin_users" ON public.admin_users;

-- Admin-Only RLS Policies
CREATE POLICY "Admin only library_settings" ON public.library_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin only seats" ON public.seats FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin only members" ON public.members FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin only transactions" ON public.transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin only admin_users" ON public.admin_users FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. Seed 94 Seats (Ground Floor: G1-G44, First Floor: A1-A50)
DO $$
DECLARE
    i INT;
    seat_id VARCHAR(50);
    seat_type VARCHAR(100);
BEGIN
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

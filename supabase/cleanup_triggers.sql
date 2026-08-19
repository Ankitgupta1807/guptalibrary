-- ============================================================================
-- GUPTA LIBRARY - SUPABASE AUTH TRIGGER CLEANUP SCRIPT
-- Location: Sasamusa, Gopalganj, Bihar - 841505
-- Purpose: Safely removes conflicting triggers & functions from auth.users
-- ============================================================================

-- Step 1: Drop ALL custom triggers on auth.users dynamically
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
        RAISE NOTICE 'Dropped trigger: % on auth.users', trg_record.trigger_name;
    END LOOP;
END $$;

-- Step 2: Drop legacy and conflicting auth trigger functions
DROP FUNCTION IF EXISTS public.handle_new_auth_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_auth_user() CASCADE;
DROP FUNCTION IF EXISTS public.on_auth_user_created() CASCADE;
DROP FUNCTION IF EXISTS public.create_user_profile() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.sync_user_profile() CASCADE;

-- Step 3: Ensure admin_users table is properly structured
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID
);

-- Step 4: Pre-authorize Master Admin Accounts
INSERT INTO public.admin_users (name, email, role)
VALUES 
  ('Ankit Gupta', 'admin@guptalibrary.com', 'admin'),
  ('Ankit Gupta', 'guptaankit8789@gmail.com', 'admin')
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- Step 5: Clean helper function for admin verification
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

-- Step 6: Enable Row Level Security
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin only admin_users" ON public.admin_users;
CREATE POLICY "Admin only admin_users" ON public.admin_users FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Done!
SELECT 'Auth triggers cleaned successfully. You can now log in without conflict.' AS status;

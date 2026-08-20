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
  ('Ankit Gupta', 'guptaankit8789@gmail.com', 'admin'),
  ('Lucky Gupta', 'guptalucky8789@gmail.com', 'admin')
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

-- Step 7: Direct Admin Creation Function (Creates Auth User + Admin Record)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.create_new_admin(
    admin_name TEXT,
    admin_email TEXT,
    admin_password TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
    new_user_id UUID;
    existing_user_id UUID;
    encrypted_pw TEXT;
BEGIN
    admin_email := lower(trim(admin_email));
    
    IF admin_email IS NULL OR admin_email = '' THEN
        RAISE EXCEPTION 'Email is required';
    END IF;
    
    IF admin_password IS NULL OR length(admin_password) < 6 THEN
        RAISE EXCEPTION 'Password must be at least 6 characters';
    END IF;

    -- Encrypt password using bcrypt
    encrypted_pw := extensions.crypt(admin_password, extensions.gen_salt('bf'));

    -- Check if user already exists in auth.users
    SELECT id INTO existing_user_id FROM auth.users WHERE email = admin_email;

    IF existing_user_id IS NOT NULL THEN
        UPDATE auth.users
        SET 
            encrypted_password = encrypted_pw,
            email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
            raw_user_meta_data = jsonb_build_object('name', admin_name),
            updated_at = NOW()
        WHERE id = existing_user_id;

        new_user_id := existing_user_id;
    ELSE
        new_user_id := gen_random_uuid();

        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            new_user_id,
            'authenticated',
            'authenticated',
            admin_email,
            encrypted_pw,
            NOW(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            jsonb_build_object('name', admin_name),
            NOW(),
            NOW()
        );
    END IF;

    -- Ensure entry exists in public.admin_users
    INSERT INTO public.admin_users (user_id, name, email, role)
    VALUES (new_user_id, admin_name, admin_email, 'admin')
    ON CONFLICT (email) DO UPDATE SET 
        name = EXCLUDED.name,
        user_id = EXCLUDED.user_id,
        role = 'admin';

    RETURN jsonb_build_object(
        'success', true,
        'user_id', new_user_id,
        'email', admin_email,
        'name', admin_name
    );
END;
$$;

-- Grant execution rights
GRANT EXECUTE ON FUNCTION public.create_new_admin(TEXT, TEXT, TEXT) TO authenticated, service_role, anon;

-- Done!
SELECT 'Auth triggers cleaned & create_new_admin RPC function installed successfully.' AS status;

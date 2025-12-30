-- Migration: Fix possible infinite recursion in RLS policies on `users`
-- Date: 2025-12-29
-- Purpose: Create a SECURITY DEFINER helper and replace problematic policies
-- IMPORTANT: Review before running on production. Run in Supabase SQL editor as an admin.

BEGIN;

-- 1) Create a SECURITY DEFINER helper function to check admin status.
--    This function is declared SECURITY DEFINER so that it runs with the
--    privileges of its owner and avoids being affected by RLS when called
--    from a policy. After creating it we attempt to set the owner to
--    'postgres' if that role exists (Supabase default admin role).
CREATE OR REPLACE FUNCTION public._is_user_admin(p_user uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.users u WHERE u.id = p_user AND (u.role = 'admin' OR u.role = 'owner')
  );
$$;

-- Try to set owner to postgres (if available) so the function executes with
-- a highly privileged role that bypasses RLS. This step may fail if your
-- environment does not allow changing owner; that's fine — function will
-- still exist as SECURITY DEFINER with current owner.
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM pg_roles WHERE rolname = 'postgres') THEN
    EXECUTE 'ALTER FUNCTION public._is_user_admin(uuid) OWNER TO postgres';
  END IF;
END$$;

-- 2) Remove existing policies on public.users to avoid the broken/recursive ones.
--    We drop them dynamically (if present) and then create safe replacements.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', r.policyname);
  END LOOP;
END$$;

-- 3) Ensure RLS is enabled (it should be) and create targeted safe policies.
--    These policies favor using auth.uid() and the helper function instead
--    of performing queries on users from within policy expressions.
-- Allow authenticated users to INSERT their own user row (with check that id equals auth.uid())
CREATE POLICY IF NOT EXISTS users_insert_auth ON public.users
  FOR INSERT
  WITH CHECK ( auth.uid() IS NOT NULL AND id = auth.uid()::uuid );

-- Allow users to SELECT/UPDATE their own row
CREATE POLICY IF NOT EXISTS users_select_own ON public.users
  FOR SELECT
  USING ( id = auth.uid()::uuid );

CREATE POLICY IF NOT EXISTS users_update_own ON public.users
  FOR UPDATE
  USING ( id = auth.uid()::uuid )
  WITH CHECK ( id = auth.uid()::uuid );

-- Allow administrators (checked via helper) to perform SELECT/UPDATE/DELETE
CREATE POLICY IF NOT EXISTS users_admin_full ON public.users
  FOR ALL
  USING ( public._is_user_admin(auth.uid()::uuid) )
  WITH CHECK ( public._is_user_admin(auth.uid()::uuid) );

-- 4) Re-enable RLS explicitly (idempotent) and commit
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

COMMIT;

-- Notes:
-- - If your Supabase deployment uses a non-standard admin role, you may need
--   to change the ALTER FUNCTION owner line above to the correct role.
-- - After running this migration, try the UI task/group creation again.
-- - If other policies reference functions that query `users`, apply the same
--   pattern: move logic into SECURITY DEFINER functions owned by an admin
--   role, or replace policy expressions with checks based on `auth.uid()`.

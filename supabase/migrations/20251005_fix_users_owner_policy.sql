-- Migration: Fix infinite recursion in users policies
-- Purpose: Remove the policy that caused infinite recursion and replace it
-- with a safe SECURITY DEFINER function + policy that checks 'owner' role.

BEGIN;

-- 1) Drop the old policy if it exists (name from original migrations)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Owner can read all users' AND tablename = 'users'
  ) THEN
    EXECUTE 'DROP POLICY "Owner can read all users" ON users';
  END IF;
END$$;

-- 2) Create or replace a helper function that checks if a given user id is owner.
-- Using SECURITY DEFINER avoids re-evaluating users policies during the check.
CREATE OR REPLACE FUNCTION public.is_owner(uid uuid) RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS(SELECT 1 FROM users WHERE id = $1 AND role = 'owner');
$$;

-- Ensure authenticated role can call the function
GRANT EXECUTE ON FUNCTION public.is_owner(uuid) TO authenticated;

-- 3) Create a new safe policy that uses the function (avoids recursion)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE polname = 'Owner can read all users (via fn)' AND tablename = 'users'
  ) THEN
    EXECUTE $sql$
      CREATE POLICY "Owner can read all users (via fn)"
      ON users
      FOR SELECT
      USING ( public.is_owner(auth.uid()) );
    $sql$;
  END IF;
END$$;

COMMIT;

-- Notes:
-- - Run this migration in Supabase SQL editor as an admin/maintainer (it uses SECURITY DEFINER function creation).
-- - After running, test the API call that previously failed.
-- - If you prefer a temporary quick fix, you can DROP the old policy only; this migration replaces it safely.

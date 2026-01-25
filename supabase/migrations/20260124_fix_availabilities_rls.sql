/*
  # Fix availabilities RLS policies

  1. Changes
    - Drop existing policy that doesn't allow INSERT
    - Create separate policies for SELECT, INSERT, UPDATE, DELETE
    - Add WITH CHECK clause for INSERT and UPDATE

  2. Security
    - Users can only manage their own availabilities
    - Admins can read group member availabilities
*/

-- Drop the existing "Users can manage their own availabilities" policy
DROP POLICY IF EXISTS "Users can manage their own availabilities" ON availabilities;

-- Create separate policies for better control
CREATE POLICY "Users can view their own availabilities"
  ON availabilities
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own availabilities"
  ON availabilities
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own availabilities"
  ON availabilities
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own availabilities"
  ON availabilities
  FOR DELETE
  USING (user_id = auth.uid());

-- Keep the admin read policy (already exists, no change needed)
-- CREATE POLICY "Admins can read group member availabilities" ...

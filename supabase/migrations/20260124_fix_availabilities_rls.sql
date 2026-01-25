/*
  # Fix availabilities RLS policies

  1. Changes
    - Drop existing policy that doesn't allow INSERT
    - Create separate policies for SELECT, INSERT, UPDATE, DELETE
    - Add WITH CHECK clause for INSERT and UPDATE
    - Add owner policies to manage all availabilities
    - Add admin policies to manage group member availabilities

  2. Security
    - Users can only manage their own availabilities
    - Owners can manage all availabilities
    - Admins can manage group member availabilities
*/

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can manage their own availabilities" ON availabilities;
DROP POLICY IF EXISTS "Users can view their own availabilities" ON availabilities;
DROP POLICY IF EXISTS "Users can insert their own availabilities" ON availabilities;
DROP POLICY IF EXISTS "Users can update their own availabilities" ON availabilities;
DROP POLICY IF EXISTS "Users can delete their own availabilities" ON availabilities;

-- User policies (manage own availabilities)
CREATE POLICY "Users can view their own availabilities"
  ON availabilities
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own availabilities"
  ON availabilities
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own availabilities"
  ON availabilities
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own availabilities"
  ON availabilities
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Owner policies (manage all availabilities)
CREATE POLICY "Owner can insert availabilities for anyone"
  ON availabilities
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'owner'
  ));

CREATE POLICY "Owner can update any availability"
  ON availabilities
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'owner'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'owner'
  ));

CREATE POLICY "Owner can delete any availability"
  ON availabilities
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role = 'owner'
  ));

-- Admin policies (manage group member availabilities)
CREATE POLICY "Admins can read group member availabilities"
  ON availabilities
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM groups g
    JOIN group_members gm ON g.id = gm.group_id
    WHERE g.admin_id = auth.uid()
    AND gm.user_id = availabilities.user_id
  ));

CREATE POLICY "Admins can insert availabilities for group members"
  ON availabilities
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM groups g
    JOIN group_members gm ON g.id = gm.group_id
    WHERE g.admin_id = auth.uid()
    AND gm.user_id = availabilities.user_id
  ));

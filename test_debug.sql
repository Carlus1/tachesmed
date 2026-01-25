-- Test: créer une fonction de debug pour vérifier ce qui se passe
CREATE OR REPLACE FUNCTION debug_is_group_admin(p_group_id UUID, p_user_id UUID)
RETURNS TABLE(found_admin_id UUID, result BOOLEAN) AS $$
DECLARE
  admin_id UUID;
  res BOOLEAN;
BEGIN
  SELECT g.admin_id INTO admin_id
  FROM groups g
  WHERE g.id = p_group_id;
  
  IF admin_id IS NULL THEN
    res := FALSE;
  ELSE
    res := admin_id = p_user_id;
  END IF;
  
  RETURN QUERY SELECT admin_id, res;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Tester avec votre groupe
SELECT * FROM debug_is_group_admin(
  (SELECT id FROM groups LIMIT 1),
  auth.uid()
);

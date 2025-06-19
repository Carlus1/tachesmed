## 🗄️ **Migrations Supabase - Partie 4 (Finales)**

### **📄 Migration 8 : 20250322192131_stark_frog.sql**
```sql
/*
  # Task Scheduling System Implementation

  1. New Tables
    - `task_schedules`: Stores task scheduling configurations
    - `task_assignments_history`: Tracks past task assignments

  2. Functions
    - `generate_task_schedule`: Generates task assignments
    - `validate_task_schedule`: Validates schedule proposals
    - `get_next_assignee`: Determines next user for task assignment

  3. Security
    - Enable RLS
    - Add policies for admin access
*/

-- Create task_schedules table
CREATE TABLE task_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    last_generated_until TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT future_start_date CHECK (start_date > CURRENT_TIMESTAMP),
    CONSTRAINT valid_date_range CHECK (end_date IS NULL OR end_date > start_date)
);

-- Create task_assignments_history table
CREATE TABLE task_assignments_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    assigned_date TIMESTAMPTZ NOT NULL,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE task_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments_history ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_task_schedules_task_id ON task_schedules(task_id);
CREATE INDEX idx_task_assignments_history_task_id ON task_assignments_history(task_id);
CREATE INDEX idx_task_assignments_history_user_id ON task_assignments_history(user_id);
CREATE INDEX idx_task_assignments_history_date ON task_assignments_history(assigned_date);

-- Create policies
CREATE POLICY "Admins can manage task schedules"
    ON task_schedules
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM tasks t
            JOIN groups g ON g.id = t.group_id
            WHERE t.id = task_schedules.task_id
            AND g.admin_id = auth.uid()
        )
    );

CREATE POLICY "Users can view task schedules"
    ON task_schedules
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM tasks t
            JOIN group_members gm ON gm.group_id = t.group_id
            WHERE t.id = task_schedules.task_id
            AND gm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view task assignments"
    ON task_assignments_history
    FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM tasks t
            JOIN groups g ON g.id = t.group_id
            WHERE t.id = task_assignments_history.task_id
            AND (
                g.admin_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM group_members gm
                    WHERE gm.group_id = g.id
                    AND gm.user_id = auth.uid()
                )
            )
        )
    );
```

### **📄 Migration 9 : 20250322195901_old_shrine.sql**
```sql
-- Drop existing policies and triggers
DROP POLICY IF EXISTS "users_base_policy_v13" ON users;
DROP POLICY IF EXISTS "availabilities_base_policy_v13" ON availabilities;
DROP TRIGGER IF EXISTS handle_auth_changes_trigger ON auth.users;
DROP FUNCTION IF EXISTS handle_auth_changes();
DROP FUNCTION IF EXISTS force_owner_role(TEXT);

-- Drop unique constraint on email
DROP INDEX IF EXISTS users_email_unique_idx;
DROP INDEX IF EXISTS users_email_lower_idx;

-- Create function to handle auth changes
CREATE OR REPLACE FUNCTION handle_auth_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Create new user profile if it doesn't exist
    INSERT INTO users (
        id,
        email,
        full_name,
        role,
        subscription_status,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        LOWER(NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        CASE 
            WHEN LOWER(NEW.email) = 'carl.frenee@gmail.com' THEN 'owner'
            ELSE 'user'
        END,
        'active',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, users.full_name),
        role = CASE 
            WHEN LOWER(EXCLUDED.email) = 'carl.frenee@gmail.com' THEN 'owner'
            ELSE users.role
        END,
        updated_at = CURRENT_TIMESTAMP;

    RETURN NEW;
END;
$$;

-- Create trigger for auth changes
CREATE TRIGGER handle_auth_changes_trigger
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_auth_changes();

-- Create simplified policies
CREATE POLICY "users_base_policy_v14"
    ON users
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "availabilities_base_policy_v14"
    ON availabilities
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE availabilities ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON users TO authenticated;
GRANT ALL ON availabilities TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Create function to force owner role
CREATE OR REPLACE FUNCTION force_owner_role(target_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Update user role to owner
    UPDATE users 
    SET 
        role = 'owner',
        updated_at = CURRENT_TIMESTAMP
    WHERE LOWER(email) = LOWER(target_email);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION force_owner_role(TEXT) TO authenticated;
```

### **📄 Migration 10 : 20250523161915_precious_pine.sql** (FINALE)
```sql
-- Drop existing policies first
DROP POLICY IF EXISTS "users_base_policy_v16" ON users;
DROP POLICY IF EXISTS "availabilities_base_policy_v16" ON availabilities;

-- Create new policies with incremented version
CREATE POLICY "users_base_policy_v17"
    ON users
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "availabilities_base_policy_v17"
    ON availabilities
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE availabilities ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON users TO authenticated;
GRANT ALL ON availabilities TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
```

## 📋 **Instructions d'exécution**

1. **Dans Supabase Dashboard** :
   - Allez dans "SQL Editor"
   - Exécutez chaque migration **dans l'ordre chronologique**
   - Vérifiez qu'il n'y a pas d'erreurs

2. **Ordre d'exécution** :
   ```
   1. 20250116003746_foggy_breeze.sql
   2. 20250119182807_humble_dew.sql
   3. 20250121204903_graceful_fog.sql
   4. 20250121204936_billowing_heart.sql
   5. 20250121205017_azure_lab.sql
   6. 20250121205042_divine_tower.sql
   7. 20250121205154_amber_portal.sql
   8. 20250322192131_stark_frog.sql
   9. 20250322195901_old_shrine.sql
   10. 20250523161915_precious_pine.sql
   ```

3. **Vérification** :
   - Toutes les tables doivent être créées
   - RLS activé sur toutes les tables
   - Politiques de sécurité en place

**🎉 Votre base de données TachesMed sera complètement configurée !**
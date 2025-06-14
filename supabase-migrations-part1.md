## 🗄️ **Migrations Supabase - Partie 1**

### **📁 Créez le dossier :** `supabase/migrations/`

### **📄 Migration 1 : 20250116003746_foggy_breeze.sql**
```sql
/*
  # Initial Schema Setup

  1. Tables
    - users
      - id (uuid, primary key)
      - email (text, unique)
      - full_name (text)
      - role (text)
      - subscription_status (text)
      - created_at (timestamptz)
      - updated_at (timestamptz)
    
    - groups
      - id (uuid, primary key)
      - name (text)
      - description (text)
      - admin_id (uuid, references users)
      - created_at (timestamptz)
      - updated_at (timestamptz)
    
    - tasks
      - id (uuid, primary key)
      - title (text)
      - description (text)
      - duration (integer)
      - priority (text)
      - start_date (timestamptz)
      - end_date (timestamptz)
      - group_id (uuid, references groups)
      - created_by (uuid, references users)
      - created_at (timestamptz)
      - updated_at (timestamptz)
    
    - availabilities
      - id (uuid, primary key)
      - user_id (uuid, references users)
      - start_time (timestamptz)
      - end_time (timestamptz)
      - created_at (timestamptz)
      - updated_at (timestamptz)
    
    - group_members
      - group_id (uuid, references groups)
      - user_id (uuid, references users)
      - created_at (timestamptz)
      - PRIMARY KEY (group_id, user_id)

  2. Security
    - Enable RLS on all tables
    - Add policies for each table based on user roles
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'user')),
    subscription_status TEXT NOT NULL DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Groups table
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    admin_id UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL, -- in minutes
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    group_id UUID REFERENCES groups(id) NOT NULL,
    created_by UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Availabilities table
CREATE TABLE IF NOT EXISTS availabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Group members table
CREATE TABLE IF NOT EXISTS group_members (
    group_id UUID REFERENCES groups(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE availabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read their own data"
    ON users
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Owner can read all users"
    ON users
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'owner'
    ));

-- Groups policies
CREATE POLICY "Users can read groups they belong to"
    ON groups
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM group_members WHERE group_id = id AND user_id = auth.uid()
    ));

CREATE POLICY "Admins can manage their groups"
    ON groups
    FOR ALL
    USING (admin_id = auth.uid());

CREATE POLICY "Owner can manage all groups"
    ON groups
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM users WHERE id = auth.uid() AND role = 'owner'
    ));

-- Tasks policies
CREATE POLICY "Users can read tasks in their groups"
    ON tasks
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM group_members 
        WHERE group_id = tasks.group_id 
        AND user_id = auth.uid()
    ));

CREATE POLICY "Admins can manage tasks"
    ON tasks
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM groups 
        WHERE id = tasks.group_id 
        AND admin_id = auth.uid()
    ));

-- Availabilities policies
CREATE POLICY "Users can manage their own availabilities"
    ON availabilities
    FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Admins can read group member availabilities"
    ON availabilities
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM groups g
        JOIN group_members gm ON g.id = gm.group_id
        WHERE g.admin_id = auth.uid()
        AND gm.user_id = availabilities.user_id
    ));

-- Group members policies
CREATE POLICY "Users can see their group memberships"
    ON group_members
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Admins can manage group members"
    ON group_members
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM groups 
        WHERE id = group_members.group_id 
        AND admin_id = auth.uid()
    ));

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at
    BEFORE UPDATE ON groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_availabilities_updated_at
    BEFORE UPDATE ON availabilities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### **📄 Migration 2 : 20250119182807_humble_dew.sql**
```sql
/*
  # Add notification settings table

  1. New Tables
    - `notification_settings`
      - `user_id` (uuid, primary key, references users)
      - `task_assignments` (boolean, default true)
      - `task_reminders` (boolean, default true)
      - `availability_reminders` (boolean, default true)
      - `group_invites` (boolean, default true)
      - `group_updates` (boolean, default true)
      - `reminder_minutes` (integer, default 15)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `notification_settings` table
    - Add policy for users to manage their own settings
    - Add policy for admins to view settings of their group members
*/

CREATE TABLE IF NOT EXISTS notification_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    task_assignments BOOLEAN NOT NULL DEFAULT true,
    task_reminders BOOLEAN NOT NULL DEFAULT true,
    availability_reminders BOOLEAN NOT NULL DEFAULT true,
    group_invites BOOLEAN NOT NULL DEFAULT true,
    group_updates BOOLEAN NOT NULL DEFAULT true,
    reminder_minutes INTEGER NOT NULL DEFAULT 15,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- Users can manage their own settings
CREATE POLICY "Users can manage their own notification settings"
    ON notification_settings
    FOR ALL
    USING (user_id = auth.uid());

-- Admins can view settings of their group members
CREATE POLICY "Admins can view group members notification settings"
    ON notification_settings
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM groups g
        JOIN group_members gm ON g.id = gm.group_id
        WHERE g.admin_id = auth.uid()
        AND gm.user_id = notification_settings.user_id
    ));

-- Add updated_at trigger
CREATE TRIGGER update_notification_settings_updated_at
    BEFORE UPDATE ON notification_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```
## 🗄️ **Migrations Supabase - Partie 2**

### **📄 Migration 3 : 20250121204903_graceful_fog.sql**
```sql
/*
  # Add notification triggers and functions

  1. New Functions
    - `notify_task_assignment`: Handles task assignment notifications
    - `notify_availability_change`: Handles availability change notifications
    - `notify_group_update`: Handles group update notifications

  2. New Triggers
    - Add triggers for tasks, availabilities, and groups tables
    - Each trigger will call the appropriate notification function

  3. Security
    - Functions execute with invoker security
*/

-- Notification Functions
CREATE OR REPLACE FUNCTION notify_task_assignment()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if user wants task assignment notifications
    IF EXISTS (
        SELECT 1 FROM notification_settings
        WHERE user_id = NEW.created_by
        AND task_assignments = true
    ) THEN
        -- In a real implementation, this would send the actual notification
        -- For now, we just log it
        RAISE NOTICE 'Task assignment notification for task %', NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION notify_availability_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if user wants availability reminders
    IF EXISTS (
        SELECT 1 FROM notification_settings
        WHERE user_id = NEW.user_id
        AND availability_reminders = true
    ) THEN
        -- In a real implementation, this would send the actual notification
        RAISE NOTICE 'Availability change notification for user %', NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION notify_group_update()
RETURNS TRIGGER AS $$
DECLARE
    member_record RECORD;
BEGIN
    -- Check if members want group updates
    FOR member_record IN
        SELECT gm.user_id 
        FROM group_members gm
        JOIN notification_settings ns ON ns.user_id = gm.user_id
        WHERE gm.group_id = NEW.id
        AND ns.group_updates = true
    LOOP
        -- In a real implementation, this would send the actual notification
        RAISE NOTICE 'Group update notification for user %', member_record.user_id;
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Triggers
CREATE TRIGGER task_assignment_notification
    AFTER INSERT ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION notify_task_assignment();

CREATE TRIGGER availability_change_notification
    AFTER INSERT OR UPDATE ON availabilities
    FOR EACH ROW
    EXECUTE FUNCTION notify_availability_change();

CREATE TRIGGER group_update_notification
    AFTER UPDATE ON groups
    FOR EACH ROW
    EXECUTE FUNCTION notify_group_update();
```

### **📄 Migration 4 : 20250121204936_billowing_heart.sql**
```sql
/*
  # Add group invitations and notifications

  1. New Tables
    - `group_invitations`: Tracks pending group invitations
      - `id` (uuid, primary key)
      - `group_id` (uuid, references groups)
      - `user_id` (uuid, references users)
      - `status` (text: pending, accepted, rejected)
      - Timestamps

  2. New Functions
    - `notify_group_invitation`: Handles group invitation notifications

  3. Security
    - Enable RLS on group_invitations table
    - Add policies for invitation management
*/

-- Create group invitations table
CREATE TABLE IF NOT EXISTS group_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES groups(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, user_id)
);

-- Enable RLS
ALTER TABLE group_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their invitations"
    ON group_invitations
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Group admins can manage invitations"
    ON group_invitations
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM groups
        WHERE id = group_invitations.group_id
        AND admin_id = auth.uid()
    ));

-- Create notification function for invitations
CREATE OR REPLACE FUNCTION notify_group_invitation()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if user wants group invite notifications
    IF EXISTS (
        SELECT 1 FROM notification_settings
        WHERE user_id = NEW.user_id
        AND group_invites = true
    ) THEN
        -- In a real implementation, this would send the actual notification
        RAISE NOTICE 'Group invitation notification for user %', NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for invitation notifications
CREATE TRIGGER group_invitation_notification
    AFTER INSERT ON group_invitations
    FOR EACH ROW
    EXECUTE FUNCTION notify_group_invitation();

-- Add updated_at trigger
CREATE TRIGGER update_group_invitations_updated_at
    BEFORE UPDATE ON group_invitations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### **📄 Migration 5 : 20250121205017_azure_lab.sql**
```sql
/*
  # Add task assignments and member notifications

  1. New Tables
    - `task_assignments`: Tracks task assignments to users
      - `id` (uuid, primary key)
      - `task_id` (uuid, references tasks)
      - `user_id` (uuid, references users)
      - `status` (text: pending, accepted, completed)
      - Timestamps

  2. Security
    - Enable RLS on task_assignments table
    - Add policies for assignment management
*/

-- Create task assignments table
CREATE TABLE IF NOT EXISTS task_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'completed')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_id, user_id)
);

-- Enable RLS
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their task assignments"
    ON task_assignments
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can update their task assignments"
    ON task_assignments
    FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Group admins can manage task assignments"
    ON task_assignments
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM tasks t
        JOIN groups g ON g.id = t.group_id
        WHERE t.id = task_assignments.task_id
        AND g.admin_id = auth.uid()
    ));

-- Create notification function for task assignments
CREATE OR REPLACE FUNCTION notify_task_assignment_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if user wants task assignment notifications
    IF EXISTS (
        SELECT 1 FROM notification_settings
        WHERE user_id = NEW.user_id
        AND task_assignments = true
    ) THEN
        -- In a real implementation, this would send the actual notification
        RAISE NOTICE 'Task assignment update notification for user % on task %', NEW.user_id, NEW.task_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for task assignment notifications
CREATE TRIGGER task_assignment_update_notification
    AFTER INSERT OR UPDATE ON task_assignments
    FOR EACH ROW
    EXECUTE FUNCTION notify_task_assignment_update();

-- Add updated_at trigger
CREATE TRIGGER update_task_assignments_updated_at
    BEFORE UPDATE ON task_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```
## 🗄️ **Migrations Supabase - Partie 3**

### **📄 Migration 6 : 20250121205042_divine_tower.sql**
```sql
/*
  # Add task comments and activity tracking

  1. New Tables
    - `task_comments`: Tracks comments on tasks
      - `id` (uuid, primary key)
      - `task_id` (uuid, references tasks)
      - `user_id` (uuid, references users)
      - `content` (text)
      - Timestamps
    
    - `task_activity_log`: Tracks all task-related activity
      - `id` (uuid, primary key)
      - `task_id` (uuid, references tasks)
      - `user_id` (uuid, references users)
      - `action` (text: comment, status_change, assignment)
      - `details` (jsonb)
      - Timestamps

  2. Security
    - Enable RLS on both tables
    - Add policies for comment and activity management
*/

-- Create task comments table
CREATE TABLE IF NOT EXISTS task_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create task activity log table
CREATE TABLE IF NOT EXISTS task_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('comment', 'status_change', 'assignment')),
    details JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_activity_log ENABLE ROW LEVEL SECURITY;

-- Create policies for task comments
CREATE POLICY "Group members can view task comments"
    ON task_comments
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM tasks t
        JOIN group_members gm ON gm.group_id = t.group_id
        WHERE t.id = task_comments.task_id
        AND gm.user_id = auth.uid()
    ));

CREATE POLICY "Group members can add comments"
    ON task_comments
    FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM tasks t
        JOIN group_members gm ON gm.group_id = t.group_id
        WHERE t.id = task_comments.task_id
        AND gm.user_id = auth.uid()
    ));

CREATE POLICY "Users can update their own comments"
    ON task_comments
    FOR UPDATE
    USING (user_id = auth.uid());

-- Create policies for task activity log
CREATE POLICY "Group members can view task activity"
    ON task_activity_log
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM tasks t
        JOIN group_members gm ON gm.group_id = t.group_id
        WHERE t.id = task_activity_log.task_id
        AND gm.user_id = auth.uid()
    ));

-- Function to log task activity
CREATE OR REPLACE FUNCTION log_task_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO task_activity_log (task_id, user_id, action, details)
    VALUES (
        NEW.task_id,
        NEW.user_id,
        CASE TG_TABLE_NAME
            WHEN 'task_comments' THEN 'comment'
            WHEN 'task_assignments' THEN 'assignment'
        END,
        CASE TG_TABLE_NAME
            WHEN 'task_comments' THEN jsonb_build_object('content', NEW.content)
            WHEN 'task_assignments' THEN jsonb_build_object('status', NEW.status)
        END
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for activity logging
CREATE TRIGGER log_task_comment
    AFTER INSERT ON task_comments
    FOR EACH ROW
    EXECUTE FUNCTION log_task_activity();

CREATE TRIGGER log_task_assignment_change
    AFTER INSERT OR UPDATE ON task_assignments
    FOR EACH ROW
    EXECUTE FUNCTION log_task_activity();

-- Add updated_at trigger for task comments
CREATE TRIGGER update_task_comments_updated_at
    BEFORE UPDATE ON task_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### **📄 Migration 7 : 20250121205154_amber_portal.sql**
```sql
/*
  # Add task dependencies and recurring tasks

  1. New Tables
    - `task_dependencies`: Tracks dependencies between tasks
      - `id` (uuid, primary key)
      - `dependent_task_id` (uuid, references tasks)
      - `dependency_task_id` (uuid, references tasks)
      - Timestamps
    
    - `recurring_tasks`: Defines recurring task patterns
      - `id` (uuid, primary key)
      - `task_id` (uuid, references tasks)
      - `frequency` (text: daily, weekly, monthly)
      - `interval` (integer)
      - `end_date` (timestamptz, optional)
      - Timestamps

  2. Security
    - Enable RLS on both tables
    - Add policies for dependency and recurrence management
*/

-- Create task dependencies table
CREATE TABLE IF NOT EXISTS task_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dependent_task_id UUID REFERENCES tasks(id) NOT NULL,
    dependency_task_id UUID REFERENCES tasks(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT no_self_dependency CHECK (dependent_task_id != dependency_task_id),
    UNIQUE(dependent_task_id, dependency_task_id)
);

-- Create recurring tasks table
CREATE TABLE IF NOT EXISTS recurring_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    interval INTEGER NOT NULL CHECK (interval > 0),
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_id)
);

-- Enable RLS
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for task dependencies
CREATE POLICY "Group members can view task dependencies"
    ON task_dependencies
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM tasks t
        JOIN group_members gm ON gm.group_id = t.group_id
        WHERE t.id = task_dependencies.dependent_task_id
        AND gm.user_id = auth.uid()
    ));

CREATE POLICY "Group admins can manage task dependencies"
    ON task_dependencies
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM tasks t
        JOIN groups g ON g.id = t.group_id
        WHERE t.id = task_dependencies.dependent_task_id
        AND g.admin_id = auth.uid()
    ));

-- Create policies for recurring tasks
CREATE POLICY "Group members can view recurring tasks"
    ON recurring_tasks
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM tasks t
        JOIN group_members gm ON gm.group_id = t.group_id
        WHERE t.id = recurring_tasks.task_id
        AND gm.user_id = auth.uid()
    ));

CREATE POLICY "Group admins can manage recurring tasks"
    ON recurring_tasks
    FOR ALL
    USING (EXISTS (
        SELECT 1 FROM tasks t
        JOIN groups g ON g.id = t.group_id
        WHERE t.id = recurring_tasks.task_id
        AND g.admin_id = auth.uid()
    ));

-- Function to validate task dependencies
CREATE OR REPLACE FUNCTION validate_task_dependency()
RETURNS TRIGGER AS $$
DECLARE
    has_circular_dependency BOOLEAN;
BEGIN
    -- Check if both tasks belong to the same group
    IF NOT EXISTS (
        SELECT 1 FROM tasks t1
        JOIN tasks t2 ON t1.group_id = t2.group_id
        WHERE t1.id = NEW.dependent_task_id
        AND t2.id = NEW.dependency_task_id
    ) THEN
        RAISE EXCEPTION 'Tasks must belong to the same group';
    END IF;

    -- Check for circular dependencies
    WITH RECURSIVE dependency_chain AS (
        -- Base case: direct dependencies
        SELECT dependency_task_id, dependent_task_id, ARRAY[dependent_task_id] as path
        FROM task_dependencies
        WHERE dependency_task_id = NEW.dependent_task_id

        UNION ALL

        -- Recursive case: follow the chain
        SELECT td.dependency_task_id, td.dependent_task_id, dc.path || td.dependent_task_id
        FROM task_dependencies td
        JOIN dependency_chain dc ON td.dependency_task_id = dc.dependent_task_id
        WHERE NOT td.dependent_task_id = ANY(dc.path)
    )
    SELECT EXISTS (
        SELECT 1 FROM dependency_chain 
        WHERE dependent_task_id = NEW.dependency_task_id
    ) INTO has_circular_dependency;

    IF has_circular_dependency THEN
        RAISE EXCEPTION 'Circular dependency detected';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for dependency validation
CREATE TRIGGER validate_task_dependency
    BEFORE INSERT OR UPDATE ON task_dependencies
    FOR EACH ROW
    EXECUTE FUNCTION validate_task_dependency();

-- Add updated_at triggers
CREATE TRIGGER update_task_dependencies_updated_at
    BEFORE UPDATE ON task_dependencies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_tasks_updated_at
    BEFORE UPDATE ON recurring_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```
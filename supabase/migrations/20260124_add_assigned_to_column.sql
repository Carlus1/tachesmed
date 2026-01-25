/*
  # Add assigned_to column to tasks table

  1. Changes
    - Add assigned_to column to tasks table (nullable UUID referencing users)
    - Add status column to tasks table (pending, completed, cancelled)
    - Add indexes for efficient querying

  2. Notes
    - assigned_to: User assigned to the task (nullable)
    - status: Task status (default: 'pending')
*/

-- Add assigned_to and status columns to tasks table
ALTER TABLE tasks 
  ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled'));

-- Add indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Add comments to document the columns
COMMENT ON COLUMN tasks.assigned_to IS 'User assigned to the task (nullable)';
COMMENT ON COLUMN tasks.status IS 'Task status: pending, completed, cancelled';

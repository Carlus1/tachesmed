/*
  # Add Task Recurrence Support

  1. Changes
    - Add recurrence_type column to tasks table (none, weekly, monthly, custom)
    - Add recurrence_interval column to tasks table (number of weeks for custom recurrence)
    - Add recurrence_end_date column to tasks table (optional end date for recurring tasks)
    - Add indexes for efficient querying of recurring tasks

  2. Notes
    - recurrence_type: 'none' (default), 'weekly', 'monthly', 'custom'
    - recurrence_interval: number of weeks between occurrences (used when recurrence_type is 'custom')
    - recurrence_end_date: optional date when recurrence should stop
*/

-- Add recurrence columns to tasks table
ALTER TABLE tasks 
  ADD COLUMN IF NOT EXISTS recurrence_type VARCHAR(20) DEFAULT 'none' CHECK (recurrence_type IN ('none', 'weekly', 'bi-weekly', 'monthly', 'bi-monthly', 'quarterly', 'semi-annually', 'yearly', 'custom')),
  ADD COLUMN IF NOT EXISTS recurrence_interval INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS recurrence_end_date TIMESTAMPTZ DEFAULT NULL;

-- Add index for efficient querying of recurring tasks
CREATE INDEX IF NOT EXISTS idx_tasks_recurrence_type ON tasks(recurrence_type) WHERE recurrence_type != 'none';
CREATE INDEX IF NOT EXISTS idx_tasks_recurrence_end_date ON tasks(recurrence_end_date) WHERE recurrence_end_date IS NOT NULL;

-- Add comment to document the columns
COMMENT ON COLUMN tasks.recurrence_type IS 'Type of recurrence: none, weekly, bi-weekly, monthly, bi-monthly, quarterly, semi-annually, yearly, custom';
COMMENT ON COLUMN tasks.recurrence_interval IS 'Number of weeks between occurrences when recurrence_type is custom';
COMMENT ON COLUMN tasks.recurrence_end_date IS 'Optional end date for recurring tasks';

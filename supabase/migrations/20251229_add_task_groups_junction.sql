-- Create task_groups junction table to support many-to-many relationship between tasks and groups
CREATE TABLE IF NOT EXISTS public.task_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(task_id, group_id)
);

-- Create index on task_id and group_id for efficient queries
CREATE INDEX IF NOT EXISTS idx_task_groups_task_id ON public.task_groups(task_id);
CREATE INDEX IF NOT EXISTS idx_task_groups_group_id ON public.task_groups(group_id);

-- Enable RLS on task_groups table
ALTER TABLE public.task_groups ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow users to read task_groups if they are admin of the group or member of the group
CREATE POLICY "Users can read task_groups of their groups"
  ON public.task_groups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = task_groups.group_id
      AND (g.admin_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.group_members gm
        WHERE gm.group_id = g.id AND gm.user_id = auth.uid()
      ))
    )
  );

-- RLS Policy: Allow admins of a group to insert task_groups for that group
CREATE POLICY "Group admins can insert task_groups"
  ON public.task_groups FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = task_groups.group_id
      AND g.admin_id = auth.uid()
    )
  );

-- RLS Policy: Allow admins of a group to delete task_groups for that group
CREATE POLICY "Group admins can delete task_groups"
  ON public.task_groups FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = task_groups.group_id
      AND g.admin_id = auth.uid()
    )
  );

-- Backfill task_groups from existing tasks' group_id field (one-way migration)
-- Each task gets inserted into task_groups with its current group_id
INSERT INTO public.task_groups (task_id, group_id)
SELECT id, group_id FROM public.tasks
WHERE group_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.task_groups tg WHERE tg.task_id = tasks.id
  )
ON CONFLICT (task_id, group_id) DO NOTHING;

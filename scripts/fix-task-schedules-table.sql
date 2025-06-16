-- Ensure task_schedules table has proper structure

-- Add is_active column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'task_schedules' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE task_schedules ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_task_schedules_active_scheduled 
ON task_schedules (task_id, is_active, scheduled_for) 
WHERE is_active = true;

-- Set existing schedules to active if they're in the future
UPDATE task_schedules 
SET is_active = true 
WHERE is_active IS NULL 
AND scheduled_for > NOW();

-- Set past schedules to inactive
UPDATE task_schedules 
SET is_active = false 
WHERE is_active IS NULL 
AND scheduled_for <= NOW();

-- Debug script to check skip functionality

-- 1. Check task_schedules table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'task_schedules' 
ORDER BY ordinal_position;

-- 2. Check recent task_schedules entries
SELECT * FROM task_schedules 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. Check recent task_notes entries
SELECT * FROM task_notes 
WHERE note_type IN ('skip_reason', 'pause_reason')
ORDER BY created_at DESC 
LIMIT 10;

-- 4. Check tasks with scheduled status
SELECT id, title, status, updated_at 
FROM tasks 
WHERE status = 'scheduled' 
ORDER BY updated_at DESC 
LIMIT 10;

-- 5. Check if task_schedules has is_active column
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'task_schedules' 
    AND column_name = 'is_active'
) as has_is_active_column;

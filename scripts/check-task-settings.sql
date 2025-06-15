-- Check current task settings
SELECT 
    'Current task settings:' as info,
    user_id,
    show_completed_tasks,
    created_at,
    updated_at
FROM task_settings 
WHERE user_id = auth.uid();

-- If no settings exist, create default
INSERT INTO task_settings (user_id, show_completed_tasks)
SELECT auth.uid(), 'last_1_hour'
WHERE NOT EXISTS (
    SELECT 1 FROM task_settings WHERE user_id = auth.uid()
);

-- Update to ensure it's set to last_1_hour
UPDATE task_settings 
SET show_completed_tasks = 'last_1_hour',
    updated_at = NOW()
WHERE user_id = auth.uid();

-- Verify the update
SELECT 
    'Updated task settings:' as info,
    user_id,
    show_completed_tasks,
    updated_at
FROM task_settings 
WHERE user_id = auth.uid();

-- Ensure task settings exist and are set correctly
INSERT INTO task_settings (user_id, show_completed_tasks)
SELECT auth.uid(), 'last_1_hour'
WHERE NOT EXISTS (
    SELECT 1 FROM task_settings WHERE user_id = auth.uid()
)
ON CONFLICT (user_id) DO UPDATE SET
    show_completed_tasks = 'last_1_hour',
    updated_at = NOW();

-- Verify the settings
SELECT 
    'Current settings:' as info,
    show_completed_tasks,
    updated_at
FROM task_settings 
WHERE user_id = auth.uid();

-- Test the stored procedure with your user ID
-- First, let's see what user ID we're working with
SELECT 
    'Current user and settings:' as info,
    auth.uid() as current_user_id,
    ts.show_completed_tasks
FROM task_settings ts 
WHERE ts.user_id = auth.uid();

-- Test the stored procedure
SELECT 'Testing stored procedure:' as info;
SELECT * FROM get_user_tasks_filtered(auth.uid());

-- Compare with direct query
SELECT 'Direct query for comparison:' as info;
SELECT 
    title,
    status,
    completed_at,
    created_at
FROM tasks 
WHERE is_deleted = false 
AND (
    status != 'completed' 
    OR 
    (status = 'completed' AND completed_at >= NOW() - INTERVAL '1 hour')
)
ORDER BY created_at DESC;

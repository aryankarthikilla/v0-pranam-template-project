-- Test the fixed stored procedure
SELECT 'Testing fixed stored procedure:' as info;

-- This should now work without errors
SELECT 
    title,
    status,
    completed_at,
    created_at
FROM get_user_tasks_filtered(auth.uid())
ORDER BY created_at DESC;

-- Count the results
SELECT 
    'Result count:' as info,
    COUNT(*) as total_tasks,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,
    COUNT(CASE WHEN status != 'completed' THEN 1 END) as active_tasks
FROM get_user_tasks_filtered(auth.uid());

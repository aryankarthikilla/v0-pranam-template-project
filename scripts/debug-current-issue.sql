-- Debug what's happening with the stored procedure
SELECT 'Current time and settings:' as info;
SELECT 
    NOW() as current_time,
    NOW() - INTERVAL '1 hour' as one_hour_ago,
    ts.show_completed_tasks as current_setting
FROM task_settings ts 
WHERE ts.user_id = auth.uid();

-- Test what the stored procedure is actually returning
SELECT 'What stored procedure returns:' as info;
SELECT 
    title,
    status,
    completed_at,
    CASE 
        WHEN status != 'completed' THEN 'Should show (not completed)'
        WHEN completed_at >= NOW() - INTERVAL '1 hour' THEN 'Should show (recent)'
        ELSE 'Should HIDE (too old)'
    END as expected_visibility
FROM get_user_tasks_filtered(auth.uid())
ORDER BY completed_at DESC NULLS LAST;

-- Check if the procedure is even being called by looking at logs
-- Let's also test the filtering logic directly
SELECT 'Direct filtering test:' as info;
SELECT 
    title,
    status,
    completed_at,
    'Direct query result' as source
FROM tasks 
WHERE is_deleted = false 
AND (
    status != 'completed' 
    OR 
    (status = 'completed' AND completed_at >= NOW() - INTERVAL '1 hour')
)
ORDER BY created_at DESC;

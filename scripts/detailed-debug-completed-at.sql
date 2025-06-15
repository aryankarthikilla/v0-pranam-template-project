-- Check the actual completed_at values
SELECT 
    title,
    status,
    completed_at,
    updated_at,
    created_at,
    CASE 
        WHEN completed_at IS NULL THEN 'NULL'
        ELSE completed_at::TEXT
    END as completed_at_text,
    CASE 
        WHEN completed_at IS NULL AND status = 'completed' THEN 'MISSING'
        WHEN completed_at IS NOT NULL AND status = 'completed' THEN 'HAS_VALUE'
        ELSE 'NOT_COMPLETED'
    END as completed_at_status
FROM tasks 
WHERE is_deleted = false 
ORDER BY created_at DESC;

-- Check current time
SELECT NOW() as current_time;

-- Check user settings
SELECT user_id, show_completed_tasks 
FROM task_settings;

-- Test the time calculation
SELECT 
    NOW() as current_time,
    NOW() - INTERVAL '1 hour' as one_hour_ago,
    NOW() - INTERVAL '30 minutes' as thirty_min_ago;

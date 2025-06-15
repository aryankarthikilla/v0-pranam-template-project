-- Test the filtering logic directly
WITH user_setting AS (
    SELECT COALESCE(show_completed_tasks, 'last_1_hour') as setting
    FROM task_settings 
    WHERE user_id = auth.uid()
    LIMIT 1
),
cutoff_time AS (
    SELECT 
        CASE 
            WHEN setting = 'last_1_hour' THEN NOW() - INTERVAL '1 hour'
            WHEN setting = 'last_30_min' THEN NOW() - INTERVAL '30 minutes'
            WHEN setting = 'last_6_hours' THEN NOW() - INTERVAL '6 hours'
            WHEN setting = 'no' THEN NULL
            ELSE NOW() - INTERVAL '1 day'
        END as cutoff,
        setting
    FROM user_setting
)
SELECT 
    t.title,
    t.status,
    t.completed_at,
    ct.cutoff as cutoff_time,
    ct.setting as user_setting,
    CASE 
        WHEN t.status != 'completed' THEN 'SHOW (not completed)'
        WHEN ct.setting = 'no' THEN 'HIDE (setting is no)'
        WHEN t.completed_at IS NULL THEN 'HIDE (no completed_at)'
        WHEN t.completed_at >= ct.cutoff THEN 'SHOW (within time)'
        ELSE 'HIDE (too old)'
    END as should_display,
    CASE 
        WHEN t.completed_at IS NOT NULL THEN 
            EXTRACT(EPOCH FROM (NOW() - t.completed_at))/3600 || ' hours ago'
        ELSE 'No completion time'
    END as completed_ago
FROM tasks t
CROSS JOIN cutoff_time ct
WHERE t.is_deleted = false
ORDER BY t.created_at DESC;

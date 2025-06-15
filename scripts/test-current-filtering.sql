-- Test the filtering logic with your actual data
WITH current_settings AS (
    SELECT 'last_1_hour' as setting,
           NOW() as current_time,
           NOW() - INTERVAL '1 hour' as cutoff_time
),
task_analysis AS (
    SELECT 
        t.title,
        t.status,
        t.completed_at,
        cs.cutoff_time,
        cs.current_time,
        CASE 
            WHEN t.status != 'completed' THEN 'SHOW (not completed)'
            WHEN t.status = 'completed' AND t.completed_at >= cs.cutoff_time THEN 'SHOW (completed recently)'
            WHEN t.status = 'completed' AND t.completed_at < cs.cutoff_time THEN 'HIDE (completed too long ago)'
            ELSE 'UNKNOWN'
        END as should_display,
        CASE 
            WHEN t.status = 'completed' THEN 
                EXTRACT(EPOCH FROM (cs.current_time - t.completed_at))/3600 
            ELSE NULL 
        END as hours_since_completion
    FROM tasks t
    CROSS JOIN current_settings cs
    WHERE t.is_deleted = false
    ORDER BY t.completed_at DESC NULLS LAST
)
SELECT 
    title,
    status,
    completed_at,
    ROUND(hours_since_completion::numeric, 2) as hours_ago,
    should_display
FROM task_analysis;

-- Now test what the stored procedure should return
SELECT 'Expected results for last_1_hour setting:' as info;

SELECT 
    title,
    status,
    completed_at,
    'Should be visible' as note
FROM tasks 
WHERE is_deleted = false 
AND (
    status != 'completed' 
    OR 
    (status = 'completed' AND completed_at >= NOW() - INTERVAL '1 hour')
)
ORDER BY created_at DESC;

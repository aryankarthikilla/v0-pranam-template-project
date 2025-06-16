-- Fix Task Settings Issues
-- This script will clean up duplicate entries and fix filter key mismatches

-- 1. Remove duplicate task_settings entries with NULL user_id
DELETE FROM task_settings 
WHERE user_id IS NULL;

-- 2. Add missing "no" filter to completed_filters if it doesn't exist
INSERT INTO completed_filters (filter_key, interval_value)
SELECT 'no', NULL
WHERE NOT EXISTS (
    SELECT 1 FROM completed_filters WHERE filter_key = 'no'
);

-- 3. Update any old filter keys to match the new system
UPDATE task_settings 
SET show_completed_tasks = CASE 
    WHEN show_completed_tasks = 'last_5_min' THEN '5 min'
    WHEN show_completed_tasks = 'last_10_min' THEN '10 min'
    WHEN show_completed_tasks = 'last_30_min' THEN '30 min'
    WHEN show_completed_tasks = 'last_1_hour' THEN '1 hour'
    WHEN show_completed_tasks = 'last_2_hours' THEN '2 hours'
    WHEN show_completed_tasks = 'last_3_hours' THEN '3 hours'
    WHEN show_completed_tasks = 'last_6_hours' THEN '6 hours'
    WHEN show_completed_tasks = 'last_12_hours' THEN '12 hours'
    WHEN show_completed_tasks = 'today' THEN 'Today'
    WHEN show_completed_tasks = 'this_week' THEN '1 week'
    WHEN show_completed_tasks = 'this_month' THEN '1 month'
    WHEN show_completed_tasks = 'all' THEN '1 year' -- Map 'all' to longest period
    ELSE show_completed_tasks
END,
updated_at = NOW()
WHERE show_completed_tasks IN (
    'last_5_min', 'last_10_min', 'last_30_min', 'last_1_hour', 
    'last_2_hours', 'last_3_hours', 'last_6_hours', 'last_12_hours',
    'today', 'this_week', 'this_month', 'all'
);

-- 4. Verify the cleanup
SELECT 'After cleanup - task_settings:' as info;
SELECT 
    id,
    user_id,
    show_completed_tasks,
    created_at,
    updated_at
FROM task_settings
ORDER BY created_at;

-- 5. Show available filters
SELECT 'Available completed filters:' as info;
SELECT 
    filter_key,
    interval_value
FROM completed_filters
ORDER BY 
    CASE 
        WHEN filter_key = 'no' THEN 0
        WHEN interval_value IS NULL THEN 1
        ELSE 2
    END,
    interval_value;

-- 6. Test the stored procedure with current user
SELECT 'Testing stored procedure:' as info;
SELECT COUNT(*) as total_tasks_returned
FROM get_user_tasks(auth.uid());

-- 7. Show what tasks should be visible with current setting
WITH user_setting AS (
    SELECT show_completed_tasks
    FROM task_settings
    WHERE user_id = auth.uid()
), current_filter AS (
    SELECT 
        us.show_completed_tasks,
        cf.interval_value
    FROM user_setting us
    LEFT JOIN completed_filters cf ON cf.filter_key = us.show_completed_tasks
)
SELECT 
    'Expected visible tasks with current setting:' as info,
    (SELECT show_completed_tasks FROM user_setting) as current_setting,
    COUNT(*) as should_be_visible
FROM tasks t
CROSS JOIN current_filter cf
WHERE t.is_deleted = false
AND (
    t.status NOT IN ('completed', 'done')
    OR (
        cf.show_completed_tasks != 'no' 
        AND cf.show_completed_tasks IS NOT NULL
        AND (
            (cf.show_completed_tasks = 'Today' AND t.completed_at >= date_trunc('day', now()))
            OR (cf.interval_value IS NOT NULL AND t.completed_at >= now() - cf.interval_value)
        )
    )
);

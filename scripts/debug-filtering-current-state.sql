-- Debug Current Filtering State
-- This script will show you exactly what's happening with the task filtering

-- 1. Show current user and their settings
SELECT 'Current user and settings:' as info;
SELECT 
    auth.uid() as current_user_id,
    ts.show_completed_tasks,
    ts.updated_at as settings_updated
FROM task_settings ts
WHERE ts.user_id = auth.uid();

-- 2. Show all tasks with their completion status
SELECT 'All tasks with completion info:' as info;
SELECT 
    title,
    status,
    completed_at,
    CASE 
        WHEN completed_at IS NULL THEN 'No completion time'
        ELSE EXTRACT(EPOCH FROM (NOW() - completed_at))/60 || ' minutes ago'
    END as time_since_completion,
    is_deleted
FROM tasks
WHERE is_deleted = false
ORDER BY 
    CASE WHEN status IN ('completed', 'done') THEN 1 ELSE 0 END,
    completed_at DESC NULLS LAST;

-- 3. Test what the stored procedure returns
SELECT 'What stored procedure returns:' as info;
SELECT 
    title,
    status,
    completed_at,
    CASE 
        WHEN completed_at IS NULL THEN 'No completion time'
        ELSE EXTRACT(EPOCH FROM (NOW() - completed_at))/60 || ' minutes ago'
    END as time_since_completion
FROM get_user_tasks(auth.uid())
ORDER BY 
    CASE WHEN status IN ('completed', 'done') THEN 1 ELSE 0 END,
    completed_at DESC NULLS LAST;

-- 4. Show the filter logic breakdown
WITH user_setting AS (
    SELECT show_completed_tasks
    FROM task_settings
    WHERE user_id = auth.uid()
), filter_info AS (
    SELECT 
        us.show_completed_tasks,
        cf.interval_value,
        CASE 
            WHEN us.show_completed_tasks = 'no' THEN 'Hide all completed tasks'
            WHEN us.show_completed_tasks = 'Today' THEN 'Show completed tasks from today'
            WHEN cf.interval_value IS NOT NULL THEN 'Show completed tasks from last ' || us.show_completed_tasks
            ELSE 'Unknown filter'
        END as filter_description,
        CASE 
            WHEN us.show_completed_tasks = 'Today' THEN date_trunc('day', now())
            WHEN cf.interval_value IS NOT NULL THEN now() - cf.interval_value
            ELSE NULL
        END as cutoff_time
    FROM user_setting us
    LEFT JOIN completed_filters cf ON cf.filter_key = us.show_completed_tasks
)
SELECT 
    'Filter logic breakdown:' as info,
    show_completed_tasks as setting,
    filter_description,
    cutoff_time,
    NOW() as current_time
FROM filter_info;

-- 5. Show which tasks should be visible based on the logic
WITH user_setting AS (
    SELECT show_completed_tasks
    FROM task_settings
    WHERE user_id = auth.uid()
), filter_info AS (
    SELECT 
        us.show_completed_tasks,
        cf.interval_value,
        CASE 
            WHEN us.show_completed_tasks = 'Today' THEN date_trunc('day', now())
            WHEN cf.interval_value IS NOT NULL THEN now() - cf.interval_value
            ELSE NULL
        END as cutoff_time
    FROM user_setting us
    LEFT JOIN completed_filters cf ON cf.filter_key = us.show_completed_tasks
)
SELECT 
    'Task visibility analysis:' as info,
    t.title,
    t.status,
    t.completed_at,
    fi.cutoff_time,
    CASE 
        WHEN t.status NOT IN ('completed', 'done') THEN 'VISIBLE (not completed)'
        WHEN fi.show_completed_tasks = 'no' THEN 'HIDDEN (setting is no)'
        WHEN fi.show_completed_tasks = 'Today' AND t.completed_at >= date_trunc('day', now()) THEN 'VISIBLE (completed today)'
        WHEN fi.show_completed_tasks = 'Today' AND t.completed_at < date_trunc('day', now()) THEN 'HIDDEN (not completed today)'
        WHEN fi.cutoff_time IS NOT NULL AND t.completed_at >= fi.cutoff_time THEN 'VISIBLE (within time range)'
        WHEN fi.cutoff_time IS NOT NULL AND t.completed_at < fi.cutoff_time THEN 'HIDDEN (outside time range)'
        ELSE 'UNKNOWN'
    END as should_be_visible
FROM tasks t
CROSS JOIN filter_info fi
WHERE t.is_deleted = false
ORDER BY 
    CASE WHEN t.status IN ('completed', 'done') THEN 1 ELSE 0 END,
    t.completed_at DESC NULLS LAST;

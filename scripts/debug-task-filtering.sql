-- Debug script to check task filtering
-- Run this to see what's happening with your tasks and settings

-- 1. Check your current task settings
SELECT 
    user_id,
    show_completed_tasks,
    created_at,
    updated_at
FROM task_settings 
WHERE user_id = auth.uid();

-- 2. Check all your tasks with completion info
SELECT 
    title,
    status,
    completed_at,
    updated_at,
    created_at,
    CASE 
        WHEN completed_at IS NOT NULL THEN 
            EXTRACT(EPOCH FROM (NOW() - completed_at))/3600 
        ELSE NULL 
    END as hours_since_completion
FROM tasks 
WHERE is_deleted = false
ORDER BY created_at DESC;

-- 3. Test the filtering logic manually
-- This should show only tasks completed in last 1 hour + all non-completed tasks
SELECT 
    title,
    status,
    completed_at,
    CASE 
        WHEN completed_at IS NOT NULL THEN 
            EXTRACT(EPOCH FROM (NOW() - completed_at))/3600 
        ELSE NULL 
    END as hours_since_completion
FROM tasks 
WHERE is_deleted = false
AND (
    status != 'completed' 
    OR 
    (status = 'completed' AND completed_at >= NOW() - INTERVAL '1 hour')
)
ORDER BY created_at DESC;

-- 4. Check if completed_at is properly set
SELECT 
    title,
    status,
    completed_at IS NULL as missing_completed_at,
    updated_at
FROM tasks 
WHERE status = 'completed' 
AND is_deleted = false;

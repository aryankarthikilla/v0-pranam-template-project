-- Synchronize task statuses with their actual session states
-- This fixes tasks that show as "in_progress" but have no active sessions

-- First, let's see what needs to be fixed
SELECT 
    t.id,
    t.title,
    t.status as current_status,
    t.current_session_id,
    COUNT(ts.id) FILTER (WHERE ts.is_active = true AND ts.ended_at IS NULL) as active_sessions_count,
    CASE 
        WHEN COUNT(ts.id) FILTER (WHERE ts.is_active = true AND ts.ended_at IS NULL) = 0 
        AND t.status = 'in_progress' THEN 'NEEDS_RESET_TO_PENDING'
        WHEN COUNT(ts.id) FILTER (WHERE ts.is_active = true AND ts.ended_at IS NULL) > 0 
        AND t.status != 'in_progress' THEN 'NEEDS_SET_TO_IN_PROGRESS'
        ELSE 'OK'
    END as action_needed
FROM tasks t
LEFT JOIN task_sessions ts ON t.id = ts.task_id
WHERE t.status IN ('in_progress', 'active', 'pending')
GROUP BY t.id, t.title, t.status, t.current_session_id
HAVING 
    -- Tasks marked as in_progress but no active sessions
    (COUNT(ts.id) FILTER (WHERE ts.is_active = true AND ts.ended_at IS NULL) = 0 AND t.status = 'in_progress')
    OR
    -- Tasks with active sessions but not marked as in_progress
    (COUNT(ts.id) FILTER (WHERE ts.is_active = true AND ts.ended_at IS NULL) > 0 AND t.status != 'in_progress');

-- Now fix the issues
-- 1. Reset tasks that show as in_progress but have no active sessions
UPDATE tasks 
SET 
    status = 'pending',
    current_session_id = NULL,
    updated_at = NOW()
WHERE id IN (
    SELECT t.id
    FROM tasks t
    LEFT JOIN task_sessions ts ON t.id = ts.task_id
    WHERE t.status = 'in_progress'
    GROUP BY t.id
    HAVING COUNT(ts.id) FILTER (WHERE ts.is_active = true AND ts.ended_at IS NULL) = 0
);

-- 2. Set tasks to in_progress if they have active sessions but wrong status
UPDATE tasks 
SET 
    status = 'in_progress',
    updated_at = NOW()
WHERE id IN (
    SELECT t.id
    FROM tasks t
    LEFT JOIN task_sessions ts ON t.id = ts.task_id
    WHERE t.status != 'in_progress'
    GROUP BY t.id
    HAVING COUNT(ts.id) FILTER (WHERE ts.is_active = true AND ts.ended_at IS NULL) > 0
);

-- Show the results
SELECT 
    'Tasks synchronized' as action,
    COUNT(*) as count
FROM tasks t
LEFT JOIN task_sessions ts ON t.id = ts.task_id
WHERE t.status IN ('in_progress', 'pending')
GROUP BY t.status
ORDER BY t.status;

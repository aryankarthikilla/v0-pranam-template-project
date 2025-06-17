-- Fix the specific orphaned task
-- This task shows as in_progress but has no active session

-- First, let's see what we're dealing with
SELECT 
    'BEFORE FIX' as status,
    t.id,
    t.title,
    t.status,
    t.current_session_id,
    COUNT(ts.id) FILTER (WHERE ts.is_active = true AND ts.ended_at IS NULL) as active_sessions
FROM tasks t
LEFT JOIN task_sessions ts ON t.id = ts.task_id
WHERE t.id = '161fd852-438f-46c4-acea-126884af92ce'
GROUP BY t.id, t.title, t.status, t.current_session_id;

-- Fix the orphaned task by resetting it to pending
UPDATE tasks 
SET 
    status = 'pending',
    current_session_id = NULL,
    updated_at = NOW()
WHERE id = '161fd852-438f-46c4-acea-126884af92ce'
AND status = 'in_progress';

-- End any sessions that might be lingering for this task
UPDATE task_sessions 
SET 
    ended_at = NOW(),
    is_active = false
WHERE task_id = '161fd852-438f-46c4-acea-126884af92ce'
AND ended_at IS NULL;

-- Verify the fix
SELECT 
    'AFTER FIX' as status,
    t.id,
    t.title,
    t.status,
    t.current_session_id,
    COUNT(ts.id) FILTER (WHERE ts.is_active = true AND ts.ended_at IS NULL) as active_sessions
FROM tasks t
LEFT JOIN task_sessions ts ON t.id = ts.task_id
WHERE t.id = '161fd852-438f-46c4-acea-126884af92ce'
GROUP BY t.id, t.title, t.status, t.current_session_id;

-- Final validation - should show 0 active tasks and 0 active sessions
SELECT 
    'FINAL STATE' as section,
    COUNT(*) FILTER (WHERE t.status = 'in_progress') as tasks_in_progress,
    COUNT(DISTINCT ts.task_id) FILTER (WHERE ts.is_active = true AND ts.ended_at IS NULL) as tasks_with_active_sessions
FROM tasks t
LEFT JOIN task_sessions ts ON t.id = ts.task_id;

-- Final synchronization to fix the remaining 5 orphaned tasks
-- Fixed version without ROW_COUNT() function

-- First, let's identify the exact problem
SELECT 
    t.id,
    t.title,
    t.status,
    t.current_session_id,
    COUNT(ts.id) FILTER (WHERE ts.is_active = true AND ts.ended_at IS NULL) as active_sessions,
    CASE 
        WHEN t.status = 'in_progress' AND COUNT(ts.id) FILTER (WHERE ts.is_active = true AND ts.ended_at IS NULL) = 0 
        THEN 'ORPHANED - NEEDS RESET'
        ELSE 'OK'
    END as issue_type
FROM tasks t
LEFT JOIN task_sessions ts ON t.id = ts.task_id
WHERE t.status = 'in_progress'
GROUP BY t.id, t.title, t.status, t.current_session_id
ORDER BY t.updated_at DESC;

-- Fix the orphaned tasks by resetting them to pending
DO $$
DECLARE
    affected_count INTEGER;
BEGIN
    UPDATE tasks 
    SET 
        status = 'pending',
        current_session_id = NULL,
        updated_at = NOW()
    WHERE id IN (
        SELECT t.id
        FROM tasks t
        LEFT JOIN task_sessions ts ON t.id = ts.task_id AND ts.is_active = true AND ts.ended_at IS NULL
        WHERE t.status = 'in_progress'
        GROUP BY t.id
        HAVING COUNT(ts.id) = 0
    );
    
    GET DIAGNOSTICS affected_count = ROW_COUNT;
    RAISE NOTICE 'Fixed orphaned tasks: %', affected_count;
END $$;

-- Final validation - should show perfect sync
SELECT 
    'FINAL VALIDATION' as section,
    COUNT(*) FILTER (WHERE t.status = 'in_progress') as tasks_in_progress,
    COUNT(*) FILTER (WHERE t.status = 'pending') as tasks_pending,
    COUNT(DISTINCT ts.task_id) FILTER (WHERE ts.is_active = true AND ts.ended_at IS NULL) as tasks_with_active_sessions,
    COUNT(ts.id) FILTER (WHERE ts.is_active = true AND ts.ended_at IS NULL) as total_active_sessions
FROM tasks t
LEFT JOIN task_sessions ts ON t.id = ts.task_id
WHERE t.status IN ('pending', 'in_progress');

-- Show the clean state
SELECT 
    t.id,
    t.title,
    t.status,
    CASE WHEN ts.id IS NOT NULL THEN 'HAS_ACTIVE_SESSION' ELSE 'NO_ACTIVE_SESSION' END as session_status
FROM tasks t
LEFT JOIN task_sessions ts ON t.id = ts.task_id AND ts.is_active = true AND ts.ended_at IS NULL
WHERE t.status = 'in_progress'
ORDER BY t.title;

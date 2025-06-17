-- Script to verify task starting functionality
-- Run this BEFORE clicking Start, then AFTER clicking Start to compare

-- 1. CURRENT STATE CHECK
SELECT 'BEFORE START - Current State' as section;

-- Show the specific task that will be started
SELECT 
    t.id,
    t.title,
    t.status,
    t.current_session_id,
    t.updated_at,
    'Target Task' as type
FROM tasks t
WHERE t.title = 'Plan Daily Schedule'
   OR t.status = 'in_progress';

-- Show all active sessions (should be empty)
SELECT 
    ts.id as session_id,
    ts.task_id,
    ts.is_active,
    ts.started_at,
    ts.ended_at,
    t.title,
    'Active Sessions' as type
FROM task_sessions ts
JOIN tasks t ON ts.task_id = t.id
WHERE ts.is_active = true 
  AND ts.ended_at IS NULL;

-- Show task counts by status
SELECT 
    status,
    COUNT(*) as count,
    'Task Counts' as type
FROM tasks
WHERE created_by = (SELECT auth.uid())
GROUP BY status
ORDER BY status;

-- 2. WHAT TO EXPECT AFTER CLICKING START:
SELECT 'EXPECTED AFTER START' as section;
SELECT 'Task status should change to: in_progress' as expectation
UNION ALL
SELECT 'Task should have current_session_id set' as expectation
UNION ALL
SELECT 'New active session should be created' as expectation
UNION ALL
SELECT 'Session should have is_active = true and ended_at = null' as expectation;

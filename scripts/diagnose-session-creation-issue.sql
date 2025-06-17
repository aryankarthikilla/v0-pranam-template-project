-- Comprehensive diagnosis of session creation issues
-- Run this to see what's happening with sessions

SELECT 'CURRENT TASK STATE' as section;

-- 1. Check the specific task that should be active
SELECT 
    t.id,
    t.title,
    t.status,
    t.current_session_id,
    t.updated_at,
    'Task State' as type
FROM tasks t
WHERE t.title = 'Plan Daily Schedule';

-- 2. Check ALL sessions for this task (active and inactive)
SELECT 
    ts.id as session_id,
    ts.task_id,
    ts.user_id,
    ts.started_at,
    ts.ended_at,
    ts.is_active,
    ts.session_type,
    ts.device_context,
    ts.location_context,
    ts.notes,
    'All Sessions for Task' as type
FROM task_sessions ts
WHERE ts.task_id = (SELECT id FROM tasks WHERE title = 'Plan Daily Schedule')
ORDER BY ts.started_at DESC;

-- 3. Check what the get_active_sessions function returns
SELECT 'ACTIVE SESSIONS FUNCTION TEST' as section;

-- Test the stored procedure directly
SELECT * FROM get_active_sessions((SELECT auth.uid()));

-- 4. Check for any sessions that should be active but aren't being found
SELECT 
    ts.id as session_id,
    ts.task_id,
    t.title,
    ts.is_active,
    ts.ended_at,
    ts.started_at,
    CASE 
        WHEN ts.is_active = true AND ts.ended_at IS NULL THEN 'Should be found by get_active_sessions'
        ELSE 'Not active or ended'
    END as expected_status,
    'Session Analysis' as type
FROM task_sessions ts
JOIN tasks t ON ts.task_id = t.id
WHERE ts.user_id = (SELECT auth.uid())
  AND ts.started_at > NOW() - INTERVAL '1 hour'  -- Recent sessions
ORDER BY ts.started_at DESC;

-- 5. Check if there are multiple sessions for the same task
SELECT 
    ts.task_id,
    t.title,
    COUNT(*) as session_count,
    COUNT(CASE WHEN ts.is_active = true AND ts.ended_at IS NULL THEN 1 END) as active_count,
    'Session Count Analysis' as type
FROM task_sessions ts
JOIN tasks t ON ts.task_id = t.id
WHERE ts.user_id = (SELECT auth.uid())
GROUP BY ts.task_id, t.title
HAVING COUNT(CASE WHEN ts.is_active = true AND ts.ended_at IS NULL THEN 1 END) > 0;

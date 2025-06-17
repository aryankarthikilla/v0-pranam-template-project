-- Investigation: Why are sessions not being created when tasks are started?

-- 1. Show recent tasks that should have sessions but don't
SELECT 
    t.id,
    t.title,
    t.status,
    t.current_session_id,
    t.created_at,
    t.updated_at,
    CASE 
        WHEN t.status IN ('in_progress', 'active') AND t.current_session_id IS NULL THEN 'ORPHANED'
        WHEN t.status IN ('in_progress', 'active') AND t.current_session_id IS NOT NULL THEN 'HAS_SESSION'
        ELSE 'OK'
    END as session_status
FROM tasks t
WHERE t.updated_at > NOW() - INTERVAL '24 hours'
ORDER BY t.updated_at DESC
LIMIT 20;

-- 2. Show all active/in_progress tasks and their session status
SELECT 
    t.id as task_id,
    t.title,
    t.status,
    t.current_session_id,
    t.updated_at as task_updated,
    ts.id as session_id,
    ts.started_at as session_started,
    ts.ended_at as session_ended,
    ts.is_active as session_active
FROM tasks t
LEFT JOIN task_sessions ts ON t.current_session_id = ts.id
WHERE t.status IN ('in_progress', 'active')
ORDER BY t.updated_at DESC;

-- 3. Show recent session creation activity
SELECT 
    ts.id,
    ts.task_id,
    ts.user_id,
    ts.started_at,
    ts.ended_at,
    ts.is_active,
    ts.session_type,
    t.title as task_title,
    t.status as task_status
FROM task_sessions ts
JOIN tasks t ON ts.task_id = t.id
WHERE ts.started_at > NOW() - INTERVAL '24 hours'
ORDER BY ts.started_at DESC
LIMIT 20;

-- 4. Find tasks that were updated to in_progress but have no corresponding session
WITH recent_active_tasks AS (
    SELECT 
        id,
        title,
        status,
        current_session_id,
        updated_at
    FROM tasks 
    WHERE status IN ('in_progress', 'active')
    AND updated_at > NOW() - INTERVAL '24 hours'
)
SELECT 
    rat.*,
    CASE 
        WHEN rat.current_session_id IS NULL THEN 'NO_SESSION_ID'
        WHEN ts.id IS NULL THEN 'SESSION_NOT_FOUND'
        ELSE 'SESSION_EXISTS'
    END as issue_type
FROM recent_active_tasks rat
LEFT JOIN task_sessions ts ON rat.current_session_id = ts.id
WHERE rat.current_session_id IS NULL OR ts.id IS NULL;

-- 5. Check for any sessions that exist but aren't linked to tasks
SELECT 
    ts.id as session_id,
    ts.task_id,
    ts.started_at,
    ts.is_active,
    t.id as task_exists,
    t.status as task_status,
    t.current_session_id as task_session_link
FROM task_sessions ts
LEFT JOIN tasks t ON ts.task_id = t.id
WHERE ts.is_active = true
AND ts.ended_at IS NULL
ORDER BY ts.started_at DESC;

-- 6. Show session creation patterns by hour (to identify when issues occur)
SELECT 
    DATE_TRUNC('hour', ts.started_at) as hour,
    COUNT(*) as sessions_created,
    COUNT(CASE WHEN t.current_session_id = ts.id THEN 1 END) as properly_linked,
    COUNT(CASE WHEN t.current_session_id IS NULL THEN 1 END) as not_linked_to_task
FROM task_sessions ts
JOIN tasks t ON ts.task_id = t.id
WHERE ts.started_at > NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', ts.started_at)
ORDER BY hour DESC;

-- 7. Check for any constraint violations or data integrity issues
SELECT 
    'task_sessions' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN task_id IS NULL THEN 1 END) as null_task_id,
    COUNT(CASE WHEN user_id IS NULL THEN 1 END) as null_user_id,
    COUNT(CASE WHEN started_at IS NULL THEN 1 END) as null_started_at
FROM task_sessions
WHERE started_at > NOW() - INTERVAL '24 hours';

-- 8. Show the specific problematic tasks from the error logs
SELECT 
    t.id,
    t.title,
    t.status,
    t.current_session_id,
    t.created_at,
    t.updated_at,
    ts.id as session_id,
    ts.started_at,
    ts.ended_at,
    ts.is_active
FROM tasks t
LEFT JOIN task_sessions ts ON t.id = ts.task_id AND ts.is_active = true
WHERE t.id = '753234a0-eef0-484c-9a39-c4c997158e0a'
   OR t.title LIKE '%Plan next 1-2 hours%'
   OR t.title LIKE '%Plan Daily Schedule%';

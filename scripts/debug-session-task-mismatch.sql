-- Debug script to find orphaned tasks and sessions
-- Run this to understand the data inconsistency

-- 1. Find tasks marked as active/in_progress but with no sessions
SELECT 
    t.id as task_id,
    t.title,
    t.status,
    t.current_session_id,
    t.updated_at as task_updated,
    'ORPHANED TASK - No Session' as issue_type
FROM tasks t
WHERE t.status IN ('in_progress', 'active')
AND (t.current_session_id IS NULL 
     OR NOT EXISTS (
         SELECT 1 FROM task_sessions ts 
         WHERE ts.id = t.current_session_id 
         AND ts.ended_at IS NULL
     ));

-- 2. Find active sessions with no corresponding active tasks
SELECT 
    ts.id as session_id,
    ts.task_id,
    ts.started_at,
    t.title,
    t.status,
    'ORPHANED SESSION - Task Not Active' as issue_type
FROM task_sessions ts
LEFT JOIN tasks t ON t.id = ts.task_id
WHERE ts.ended_at IS NULL
AND (t.status NOT IN ('in_progress', 'active') OR t.status IS NULL);

-- 3. Check all active sessions
SELECT 
    ts.id as session_id,
    ts.task_id,
    ts.started_at,
    ts.ended_at,
    t.title,
    t.status,
    t.current_session_id,
    CASE 
        WHEN ts.ended_at IS NULL THEN 'ACTIVE'
        ELSE 'ENDED'
    END as session_status
FROM task_sessions ts
LEFT JOIN tasks t ON t.id = ts.task_id
WHERE ts.ended_at IS NULL
ORDER BY ts.started_at DESC;

-- 4. Summary of issues
SELECT 
    'Tasks marked active but no session' as issue,
    COUNT(*) as count
FROM tasks t
WHERE t.status IN ('in_progress', 'active')
AND (t.current_session_id IS NULL 
     OR NOT EXISTS (
         SELECT 1 FROM task_sessions ts 
         WHERE ts.id = t.current_session_id 
         AND ts.ended_at IS NULL
     ))

UNION ALL

SELECT 
    'Active sessions but task not active' as issue,
    COUNT(*) as count
FROM task_sessions ts
LEFT JOIN tasks t ON t.id = ts.task_id
WHERE ts.ended_at IS NULL
AND (t.status NOT IN ('in_progress', 'active') OR t.status IS NULL);

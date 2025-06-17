-- Investigate why sessions aren't being created properly
-- This will help us understand the root cause

-- 1. Check recent task status changes
SELECT 
    t.id,
    t.title,
    t.status,
    t.current_session_id,
    t.created_at,
    t.updated_at,
    'Recent status change' as note
FROM tasks t
WHERE t.updated_at > NOW() - INTERVAL '24 hours'
ORDER BY t.updated_at DESC
LIMIT 20;

-- 2. Check recent session creation
SELECT 
    ts.id,
    ts.task_id,
    ts.started_at,
    ts.ended_at,
    t.title,
    t.status,
    'Recent session' as note
FROM task_sessions ts
LEFT JOIN tasks t ON t.id = ts.task_id
WHERE ts.started_at > NOW() - INTERVAL '24 hours'
ORDER BY ts.started_at DESC
LIMIT 20;

-- 3. Find tasks that were updated to active/in_progress but have no corresponding session
SELECT 
    t.id,
    t.title,
    t.status,
    t.current_session_id,
    t.updated_at,
    'Active but no session' as issue
FROM tasks t
WHERE t.status IN ('active', 'in_progress')
AND t.updated_at > NOW() - INTERVAL '24 hours'
AND NOT EXISTS (
    SELECT 1 FROM task_sessions ts 
    WHERE ts.task_id = t.id 
    AND ts.started_at > t.updated_at - INTERVAL '1 minute'
    AND ts.ended_at IS NULL
);

-- 4. Check if there are any constraints or triggers that might be preventing session creation
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'task_sessions';

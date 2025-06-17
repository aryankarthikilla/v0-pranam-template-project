-- Check the actual structure of task_sessions table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'task_sessions' 
ORDER BY ordinal_position;

-- Also check tasks table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'tasks' 
ORDER BY ordinal_position;

-- Show sample data to understand the current state
SELECT 
    t.id as task_id,
    t.title,
    t.status,
    t.current_session_id,
    ts.id as session_id,
    ts.started_at,
    ts.ended_at,
    CASE 
        WHEN t.status IN ('in_progress', 'active') AND t.current_session_id IS NULL THEN 'ORPHANED_TASK_NO_SESSION'
        WHEN t.status IN ('in_progress', 'active') AND ts.ended_at IS NOT NULL THEN 'ORPHANED_TASK_ENDED_SESSION'
        WHEN t.status NOT IN ('in_progress', 'active') AND ts.ended_at IS NULL THEN 'ORPHANED_SESSION'
        ELSE 'OK'
    END as issue_type
FROM tasks t
LEFT JOIN task_sessions ts ON t.current_session_id = ts.id
WHERE t.status IN ('in_progress', 'active', 'pending')
ORDER BY t.updated_at DESC
LIMIT 10;

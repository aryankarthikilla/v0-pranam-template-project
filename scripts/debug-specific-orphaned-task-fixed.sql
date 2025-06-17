-- Debug the specific task that's causing issues
SELECT 
    'TASK DETAILS' as section,
    t.id,
    t.title,
    t.status,
    t.current_session_id,
    t.updated_at
FROM tasks t 
WHERE t.id = '161fd852-438f-46c4-acea-126884af92ce';

-- Check for any sessions for this task
SELECT 
    'SESSION DETAILS' as section,
    ts.id,
    ts.task_id,
    ts.is_active,
    ts.started_at,
    ts.ended_at
FROM task_sessions ts 
WHERE ts.task_id = '161fd852-438f-46c4-acea-126884af92ce'
ORDER BY ts.started_at DESC;

-- Check what getActiveSessions would return
SELECT 
    'ACTIVE SESSIONS QUERY' as section,
    ts.id,
    ts.task_id,
    ts.is_active,
    ts.ended_at,
    t.title
FROM task_sessions ts
JOIN tasks t ON ts.task_id = t.id
WHERE ts.is_active = true 
AND ts.ended_at IS NULL
ORDER BY ts.started_at DESC;

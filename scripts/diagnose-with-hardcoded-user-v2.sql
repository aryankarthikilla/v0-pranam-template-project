-- Diagnose session issues with proper syntax

-- Get a real user ID from the database
SELECT 'AVAILABLE USERS' as section;
SELECT id, email, created_at FROM auth.users LIMIT 5;

-- Check tasks with in_progress status
SELECT 'IN PROGRESS TASKS' as section;
SELECT id, title, status, current_session_id, created_by 
FROM tasks 
WHERE status = 'in_progress'
LIMIT 10;

-- Check active sessions
SELECT 'ACTIVE SESSIONS' as section;
SELECT id, task_id, user_id, is_active, started_at, ended_at
FROM task_sessions
WHERE is_active = true AND ended_at IS NULL
LIMIT 10;

-- Test the function with the first available user
SELECT 'TESTING FUNCTION WITH REAL USER' as section;
WITH first_user AS (
    SELECT id FROM auth.users LIMIT 1
)
SELECT * FROM get_active_sessions((SELECT id FROM first_user));

-- Check for any sessions that might exist but aren't being found
SELECT 'ALL RECENT SESSIONS' as section;
SELECT 
    ts.id as session_id,
    t.title as task_title,
    ts.user_id,
    ts.is_active,
    ts.started_at,
    ts.ended_at,
    CASE 
        WHEN ts.ended_at IS NULL AND ts.is_active = true THEN 'SHOULD BE ACTIVE'
        WHEN ts.ended_at IS NOT NULL THEN 'PROPERLY ENDED'
        WHEN ts.is_active = false THEN 'INACTIVE'
        ELSE 'UNKNOWN STATE'
    END as session_status
FROM task_sessions ts
JOIN tasks t ON ts.task_id = t.id
ORDER BY ts.started_at DESC
LIMIT 10;

-- Check the specific task that's showing as active
SELECT 'SPECIFIC TASK ANALYSIS' as section;
SELECT 
    t.id,
    t.title,
    t.status,
    t.current_session_id,
    t.created_by,
    CASE 
        WHEN t.current_session_id IS NOT NULL THEN 'HAS SESSION ID'
        ELSE 'NO SESSION ID'
    END as session_id_status
FROM tasks t
WHERE t.id = '161fd852-438f-46c4-acea-126884af92ce';

-- Check if there are any sessions for this specific task
SELECT 'SESSIONS FOR SPECIFIC TASK' as section;
SELECT 
    ts.id,
    ts.task_id,
    ts.user_id,
    ts.is_active,
    ts.started_at,
    ts.ended_at
FROM task_sessions ts
WHERE ts.task_id = '161fd852-438f-46c4-acea-126884af92ce'
ORDER BY ts.started_at DESC;

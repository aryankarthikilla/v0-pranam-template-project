-- Simple diagnosis without using the problematic function

SELECT 'AVAILABLE USERS' as section;
SELECT id, email FROM auth.users LIMIT 3;

SELECT 'TASKS IN PROGRESS' as section;
SELECT id, title, status, current_session_id, created_by 
FROM tasks 
WHERE status = 'in_progress';

SELECT 'ALL ACTIVE SESSIONS' as section;
SELECT id, task_id, user_id, is_active, started_at, ended_at
FROM task_sessions
WHERE is_active = true AND ended_at IS NULL;

SELECT 'SPECIFIC TASK SESSIONS' as section;
SELECT 
    ts.id as session_id,
    ts.task_id,
    ts.user_id,
    ts.is_active,
    ts.started_at,
    ts.ended_at,
    t.title as task_title,
    t.status as task_status
FROM task_sessions ts
LEFT JOIN tasks t ON ts.task_id = t.id
WHERE ts.task_id = '161fd852-438f-46c4-acea-126884af92ce'
ORDER BY ts.started_at DESC;

SELECT 'AUTHENTICATION CHECK' as section;
SELECT 
    CASE 
        WHEN auth.uid() IS NULL THEN 'AUTH ISSUE: auth.uid() returns NULL'
        ELSE 'AUTH OK: ' || auth.uid()::TEXT
    END as auth_status;

-- Run this AFTER clicking the Start button to verify it worked

SELECT 'AFTER START - Verification' as section;

-- 1. Check the task status changed
SELECT 
    t.id,
    t.title,
    t.status,
    t.current_session_id,
    t.updated_at,
    CASE 
        WHEN t.status = 'in_progress' THEN '✅ Status correct'
        ELSE '❌ Status should be in_progress'
    END as status_check,
    CASE 
        WHEN t.current_session_id IS NOT NULL THEN '✅ Session ID set'
        ELSE '❌ Missing session ID'
    END as session_check
FROM tasks t
WHERE t.title = 'Plan Daily Schedule';

-- 2. Check the active session was created
SELECT 
    ts.id as session_id,
    ts.task_id,
    ts.user_id,
    ts.started_at,
    ts.ended_at,
    ts.is_active,
    ts.session_type,
    ts.device_context,
    t.title,
    CASE 
        WHEN ts.is_active = true AND ts.ended_at IS NULL THEN '✅ Session active'
        ELSE '❌ Session not properly active'
    END as session_status
FROM task_sessions ts
JOIN tasks t ON ts.task_id = t.id
WHERE t.title = 'Plan Daily Schedule'
ORDER BY ts.started_at DESC
LIMIT 1;

-- 3. Verify synchronization
SELECT 
    t.id as task_id,
    t.current_session_id,
    ts.id as actual_session_id,
    CASE 
        WHEN t.current_session_id = ts.id THEN '✅ Perfect sync'
        ELSE '❌ Sync mismatch'
    END as sync_check
FROM tasks t
LEFT JOIN task_sessions ts ON t.current_session_id = ts.id
WHERE t.title = 'Plan Daily Schedule';

-- 4. Overall system health check
SELECT 
    COUNT(CASE WHEN t.status = 'in_progress' THEN 1 END) as tasks_in_progress,
    COUNT(CASE WHEN ts.is_active = true AND ts.ended_at IS NULL THEN 1 END) as active_sessions,
    CASE 
        WHEN COUNT(CASE WHEN t.status = 'in_progress' THEN 1 END) = 
             COUNT(CASE WHEN ts.is_active = true AND ts.ended_at IS NULL THEN 1 END)
        THEN '✅ Perfect balance'
        ELSE '❌ Imbalance detected'
    END as system_health
FROM tasks t
LEFT JOIN task_sessions ts ON t.id = ts.task_id AND ts.is_active = true AND ts.ended_at IS NULL
WHERE t.created_by = (SELECT auth.uid());

-- Final cleanup and validation of the task/session system

-- 1. Show current state after all fixes
SELECT 
    'Current System State' as section,
    t.id,
    t.title,
    t.status,
    t.current_session_id,
    COUNT(ts.id) FILTER (WHERE ts.is_active = true AND ts.ended_at IS NULL) as active_sessions,
    CASE 
        WHEN t.status = 'in_progress' AND COUNT(ts.id) FILTER (WHERE ts.is_active = true AND ts.ended_at IS NULL) > 0 THEN '✅ GOOD'
        WHEN t.status = 'pending' AND COUNT(ts.id) FILTER (WHERE ts.is_active = true AND ts.ended_at IS NULL) = 0 THEN '✅ GOOD'
        WHEN t.status = 'completed' THEN '✅ GOOD'
        ELSE '❌ NEEDS_ATTENTION'
    END as validation_status
FROM tasks t
LEFT JOIN task_sessions ts ON t.id = ts.task_id
WHERE t.status IN ('in_progress', 'pending', 'active', 'completed')
GROUP BY t.id, t.title, t.status, t.current_session_id
ORDER BY t.updated_at DESC
LIMIT 20;

-- 2. Validate session consistency
SELECT 
    'Session Validation' as section,
    ts.id as session_id,
    ts.task_id,
    t.title,
    ts.is_active,
    ts.ended_at IS NULL as no_end_time,
    t.current_session_id = ts.id as matches_task_pointer,
    CASE 
        WHEN ts.is_active = true AND ts.ended_at IS NULL AND t.current_session_id = ts.id THEN '✅ PERFECT'
        WHEN ts.is_active = true AND ts.ended_at IS NULL AND t.current_session_id != ts.id THEN '⚠️ ACTIVE_BUT_NOT_CURRENT'
        WHEN ts.is_active = false AND ts.ended_at IS NOT NULL THEN '✅ PROPERLY_ENDED'
        ELSE '❌ INCONSISTENT'
    END as session_status
FROM task_sessions ts
JOIN tasks t ON ts.task_id = t.id
WHERE ts.created_at > NOW() - INTERVAL '24 hours'
ORDER BY ts.started_at DESC
LIMIT 20;

-- 3. Summary report
SELECT 
    'Summary Report' as section,
    COUNT(*) FILTER (WHERE t.status = 'in_progress') as tasks_in_progress,
    COUNT(*) FILTER (WHERE t.status = 'pending') as tasks_pending,
    COUNT(*) FILTER (WHERE t.status = 'completed') as tasks_completed,
    COUNT(*) FILTER (WHERE ts.is_active = true AND ts.ended_at IS NULL) as active_sessions_total,
    COUNT(DISTINCT ts.task_id) FILTER (WHERE ts.is_active = true AND ts.ended_at IS NULL) as tasks_with_active_sessions
FROM tasks t
LEFT JOIN task_sessions ts ON t.id = ts.task_id
WHERE t.created_at > NOW() - INTERVAL '7 days';

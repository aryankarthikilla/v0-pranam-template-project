-- Final verification that everything is working
SELECT 'VERIFICATION REPORT' as section;

-- Check current task status
SELECT 
    'TASK STATUS' as check_type,
    id,
    title,
    status,
    current_session_id
FROM tasks 
WHERE id = '161fd852-438f-46c4-acea-126884af92ce';

-- Check session status  
SELECT 
    'SESSION STATUS' as check_type,
    id,
    task_id,
    is_active,
    ended_at,
    CASE 
        WHEN ended_at IS NULL AND is_active = true THEN 'ACTIVE'
        WHEN ended_at IS NOT NULL THEN 'ENDED'
        ELSE 'INACTIVE'
    END as session_state
FROM task_sessions 
WHERE task_id = '161fd852-438f-46c4-acea-126884af92ce'
ORDER BY started_at DESC
LIMIT 1;

-- Test the fixed function
SELECT 
    'FUNCTION TEST' as check_type,
    COUNT(*) as active_sessions_found
FROM get_active_sessions();

-- Overall system health
SELECT 
    'SYSTEM HEALTH' as check_type,
    (SELECT COUNT(*) FROM tasks WHERE status = 'in_progress') as tasks_in_progress,
    (SELECT COUNT(*) FROM task_sessions WHERE is_active = true AND ended_at IS NULL) as active_sessions,
    CASE 
        WHEN (SELECT COUNT(*) FROM tasks WHERE status = 'in_progress') = 
             (SELECT COUNT(*) FROM task_sessions WHERE is_active = true AND ended_at IS NULL) 
        THEN '✅ SYNCHRONIZED'
        ELSE '⚠️ MISMATCH'
    END as sync_status;

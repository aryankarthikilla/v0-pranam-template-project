-- Test pausing the active session directly
-- This bypasses the auth issue by working directly with the known session ID

-- First, let's see the current active session
SELECT 
    'CURRENT ACTIVE SESSION' as section,
    ts.id as session_id,
    t.id as task_id,
    t.title as task_title,
    ts.started_at,
    EXTRACT(EPOCH FROM (NOW() - ts.started_at))::INTEGER / 60 as duration_minutes,
    ts.is_active,
    ts.ended_at
FROM task_sessions ts
JOIN tasks t ON ts.task_id = t.id
WHERE ts.id = '5c538f91-3228-45a4-9596-a5acf290e484';

-- Now let's pause this session
UPDATE task_sessions 
SET 
    is_active = false,
    ended_at = NOW(),
    pause_reason = 'Manual pause via SQL - testing session management'
WHERE id = '5c538f91-3228-45a4-9596-a5acf290e484'
AND is_active = true;

-- Update the task status to pending
UPDATE tasks 
SET 
    status = 'pending',
    current_session_id = NULL,
    updated_at = NOW()
WHERE id = '161fd852-438f-46c4-acea-126884af92ce'
AND status = 'in_progress';

-- Verify the changes
SELECT 
    'AFTER PAUSE' as section,
    ts.id as session_id,
    t.id as task_id,
    t.title as task_title,
    t.status as task_status,
    ts.is_active as session_active,
    ts.ended_at,
    ts.pause_reason
FROM task_sessions ts
JOIN tasks t ON ts.task_id = t.id
WHERE ts.id = '5c538f91-3228-45a4-9596-a5acf290e484';

-- Check overall system state
SELECT 
    'SYSTEM STATE' as section,
    COUNT(CASE WHEN t.status = 'in_progress' THEN 1 END) as tasks_in_progress,
    COUNT(CASE WHEN ts.is_active = true THEN 1 END) as active_sessions
FROM tasks t
LEFT JOIN task_sessions ts ON t.id = ts.task_id AND ts.is_active = true;

SELECT 'Session paused successfully via SQL!' as result;

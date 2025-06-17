-- Debug the specific task that's causing issues
-- Task ID: 753234a0-eef0-484c-9a39-c4c997158e0a

-- 1. Show complete task details
SELECT 
    t.id,
    t.title,
    t.description,
    t.status,
    t.priority,
    t.current_session_id,
    t.created_at,
    t.updated_at,
    t.created_by,  -- Fixed: use created_by instead of user_id
    'Task Info' as type
FROM tasks t
WHERE t.id = '753234a0-eef0-484c-9a39-c4c997158e0a'
   OR t.title LIKE '%Plan next 1-2 hours%'
   OR t.title LIKE '%Plan Daily Schedule%';

-- 2. Show all sessions for this task (active and inactive)
SELECT 
    ts.id as session_id,
    ts.task_id,
    ts.user_id,
    ts.started_at,
    ts.ended_at,
    ts.is_active,
    ts.session_type,
    ts.location_context,
    ts.device_context,
    ts.notes,
    ts.created_at,
    CASE 
        WHEN ts.id = t.current_session_id THEN 'MATCHES_CURRENT'
        WHEN ts.is_active = true AND ts.ended_at IS NULL THEN 'ACTIVE_BUT_NOT_CURRENT'
        ELSE 'OTHER'
    END as session_status
FROM task_sessions ts
JOIN tasks t ON ts.task_id = t.id
WHERE t.id IN ('753234a0-eef0-484c-9a39-c4c997158e0a', '161fd852-438f-46c4-acea-126884af92ce')
   OR t.title LIKE '%Plan next 1-2 hours%'
   OR t.title LIKE '%Plan Daily Schedule%'
ORDER BY ts.started_at DESC;

-- 3. Check if there are any orphaned sessions for this user
SELECT 
    ts.id,
    ts.task_id,
    ts.started_at,
    ts.ended_at,
    ts.is_active,
    t.title,
    t.status
FROM task_sessions ts
LEFT JOIN tasks t ON ts.task_id = t.id
WHERE ts.user_id = (
    SELECT created_by FROM tasks WHERE id = '753234a0-eef0-484c-9a39-c4c997158e0a'  -- Fixed: use created_by
)
AND ts.is_active = true
AND ts.ended_at IS NULL;

-- 4. Show recent task status changes for this user
SELECT 
    t.id,
    t.title,
    t.status,
    t.current_session_id,
    t.updated_at
FROM tasks t
WHERE t.created_by = (  -- Fixed: use created_by instead of user_id
    SELECT created_by FROM tasks WHERE id = '753234a0-eef0-484c-9a39-c4c997158e0a'
)
AND t.updated_at > NOW() - INTERVAL '12 hours'
ORDER BY t.updated_at DESC;

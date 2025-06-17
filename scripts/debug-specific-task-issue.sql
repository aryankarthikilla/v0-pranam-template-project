-- Debug the specific task that's causing issues
-- Task ID: 753234a0-eef0-484c-9a39-c4c997158e0a

-- 1. Show complete task details
SELECT 
    id,
    title,
    description,
    status,
    priority,
    current_session_id,
    created_at,
    updated_at,
    user_id,
    created_by
FROM tasks 
WHERE id = '753234a0-eef0-484c-9a39-c4c997158e0a';

-- 2. Show all sessions for this task (active and inactive)
SELECT 
    id,
    task_id,
    user_id,
    started_at,
    ended_at,
    is_active,
    session_type,
    location_context,
    device_context,
    notes,
    created_at
FROM task_sessions 
WHERE task_id = '753234a0-eef0-484c-9a39-c4c997158e0a'
ORDER BY started_at DESC;

-- 3. Show task update history (if we had audit logs)
-- This will help us understand when the task status changed

-- 4. Check if there are any orphaned sessions for this user
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
    SELECT user_id FROM tasks WHERE id = '753234a0-eef0-484c-9a39-c4c997158e0a'
)
AND ts.is_active = true
AND ts.ended_at IS NULL;

-- 5. Show recent task status changes for this user
SELECT 
    id,
    title,
    status,
    current_session_id,
    updated_at
FROM tasks 
WHERE user_id = (
    SELECT user_id FROM tasks WHERE id = '753234a0-eef0-484c-9a39-c4c997158e0a'
)
AND updated_at > NOW() - INTERVAL '12 hours'
ORDER BY updated_at DESC;

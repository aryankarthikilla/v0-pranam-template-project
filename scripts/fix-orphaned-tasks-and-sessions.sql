-- Fix orphaned tasks and sessions
-- This script will clean up data inconsistencies

-- 1. Reset orphaned tasks (marked active but no session) to pending
UPDATE tasks 
SET 
    status = 'pending',
    current_session_id = NULL,
    updated_at = NOW()
WHERE status IN ('in_progress', 'active')
AND (current_session_id IS NULL 
     OR NOT EXISTS (
         SELECT 1 FROM task_sessions ts 
         WHERE ts.id = current_session_id 
         AND ts.ended_at IS NULL
     ));

-- 2. End orphaned sessions (active sessions but task not active)
UPDATE task_sessions 
SET 
    ended_at = NOW(),
    end_reason = 'Auto-ended: Task not active'
WHERE ended_at IS NULL
AND NOT EXISTS (
    SELECT 1 FROM tasks t 
    WHERE t.id = task_sessions.task_id 
    AND t.status IN ('in_progress', 'active')
);

-- 3. Verify the fixes
SELECT 'Fixed orphaned tasks' as action, COUNT(*) as affected_rows
FROM tasks 
WHERE status = 'pending' 
AND updated_at > NOW() - INTERVAL '1 minute';

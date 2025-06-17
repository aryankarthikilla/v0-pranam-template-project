-- Fix orphaned tasks and sessions (CORRECTED VERSION)
-- This script will clean up data inconsistencies

-- 1. First, let's see what we're working with
SELECT 'Before Fix - Orphaned Tasks' as status, COUNT(*) as count
FROM tasks 
WHERE status IN ('in_progress', 'active')
AND (current_session_id IS NULL 
     OR NOT EXISTS (
         SELECT 1 FROM task_sessions ts 
         WHERE ts.id = current_session_id 
         AND ts.ended_at IS NULL
     ));

-- 2. Reset orphaned tasks (marked active but no session) to pending
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

-- 3. End orphaned sessions (active sessions but task not active)
-- Removed end_reason since column doesn't exist
UPDATE task_sessions 
SET 
    ended_at = NOW()
WHERE ended_at IS NULL
AND NOT EXISTS (
    SELECT 1 FROM tasks t 
    WHERE t.id = task_sessions.task_id 
    AND t.status IN ('in_progress', 'active')
);

-- 4. Verify the fixes
SELECT 'After Fix - Fixed Tasks' as status, COUNT(*) as count
FROM tasks 
WHERE status = 'pending' 
AND updated_at > NOW() - INTERVAL '1 minute';

SELECT 'After Fix - Ended Sessions' as status, COUNT(*) as count
FROM task_sessions 
WHERE ended_at IS NOT NULL
AND ended_at > NOW() - INTERVAL '1 minute';

-- 5. Final verification - should show 0 orphaned tasks
SELECT 'Final Check - Remaining Orphaned Tasks' as status, COUNT(*) as count
FROM tasks 
WHERE status IN ('in_progress', 'active')
AND (current_session_id IS NULL 
     OR NOT EXISTS (
         SELECT 1 FROM task_sessions ts 
         WHERE ts.id = current_session_id 
         AND ts.ended_at IS NULL
     ));

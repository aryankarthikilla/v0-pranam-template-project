-- Fix the current orphaned tasks immediately

-- 1. First, let's see what we're dealing with
SELECT 
    id,
    title,
    status,
    current_session_id,
    updated_at
FROM tasks 
WHERE status IN ('in_progress', 'active')
AND current_session_id IS NULL;

-- 2. Reset these orphaned tasks to pending status
UPDATE tasks 
SET 
    status = 'pending',
    current_session_id = NULL,
    updated_at = NOW()
WHERE status IN ('in_progress', 'active')
AND current_session_id IS NULL;

-- 3. Also end any dangling active sessions that might exist
UPDATE task_sessions 
SET 
    ended_at = NOW(),
    is_active = false,
    notes = COALESCE(notes, '') || ' [Auto-ended due to orphaned state]'
WHERE is_active = true 
AND ended_at IS NULL
AND task_id IN (
    SELECT id FROM tasks 
    WHERE status = 'pending' 
    AND current_session_id IS NULL
);

-- 4. Show the results
SELECT 
    'Fixed orphaned tasks' as action,
    COUNT(*) as count
FROM tasks 
WHERE status = 'pending'
AND updated_at > NOW() - INTERVAL '1 minute';

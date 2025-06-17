-- Fix the immediate issue: Clean up multiple active sessions per task
-- This will end all but the most recent session for each task

-- Step 1: Identify tasks with multiple active sessions
WITH multiple_sessions AS (
    SELECT 
        task_id,
        COUNT(*) as session_count
    FROM task_sessions 
    WHERE is_active = true AND ended_at IS NULL
    GROUP BY task_id
    HAVING COUNT(*) > 1
),
-- Step 2: For each task, keep only the most recent session
sessions_to_keep AS (
    SELECT DISTINCT ON (ts.task_id)
        ts.id as session_id,
        ts.task_id,
        ts.started_at
    FROM task_sessions ts
    JOIN multiple_sessions ms ON ts.task_id = ms.task_id
    WHERE ts.is_active = true AND ts.ended_at IS NULL
    ORDER BY ts.task_id, ts.started_at DESC
)
-- Step 3: End all sessions except the most recent one
UPDATE task_sessions 
SET 
    ended_at = NOW(),
    is_active = false,
    notes = COALESCE(notes, '') || ' [Auto-ended: duplicate session cleanup]'
WHERE is_active = true 
AND ended_at IS NULL
AND id NOT IN (SELECT session_id FROM sessions_to_keep)
AND task_id IN (SELECT task_id FROM multiple_sessions);

-- Step 4: Update tasks to point to the correct current session
UPDATE tasks 
SET current_session_id = (
    SELECT ts.id 
    FROM task_sessions ts 
    WHERE ts.task_id = tasks.id 
    AND ts.is_active = true 
    AND ts.ended_at IS NULL
    ORDER BY ts.started_at DESC 
    LIMIT 1
)
WHERE id IN (
    SELECT DISTINCT task_id 
    FROM task_sessions 
    WHERE is_active = true AND ended_at IS NULL
);

-- Step 5: Show what we fixed
SELECT 
    t.id,
    t.title,
    t.status,
    t.current_session_id,
    COUNT(ts.id) as active_sessions_remaining
FROM tasks t
LEFT JOIN task_sessions ts ON t.id = ts.task_id AND ts.is_active = true AND ts.ended_at IS NULL
WHERE t.status IN ('in_progress', 'active')
GROUP BY t.id, t.title, t.status, t.current_session_id
ORDER BY active_sessions_remaining DESC;

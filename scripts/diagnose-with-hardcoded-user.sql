-- Diagnose session issues with a hardcoded user ID
-- This bypasses the auth.uid() NULL issue

-- Use a hardcoded user ID for testing
DO $$
DECLARE
    test_user_id UUID := (SELECT id FROM auth.users LIMIT 1);
BEGIN
    -- Output the test user ID
    RAISE NOTICE 'Using test user ID: %', test_user_id;
    
    -- Check tasks for this user
    RAISE NOTICE 'Tasks for user:';
    FOR task_rec IN 
        SELECT id, title, status, current_session_id 
        FROM tasks 
        WHERE created_by = test_user_id
        LIMIT 10
    LOOP
        RAISE NOTICE 'Task: % (%) - Status: % - Session: %', 
            task_rec.title, task_rec.id, task_rec.status, task_rec.current_session_id;
    END LOOP;
    
    -- Check sessions for this user
    RAISE NOTICE 'Sessions for user:';
    FOR session_rec IN 
        SELECT id, task_id, is_active, started_at, ended_at 
        FROM task_sessions 
        WHERE user_id = test_user_id
        ORDER BY started_at DESC
        LIMIT 10
    LOOP
        RAISE NOTICE 'Session: % - Task: % - Active: % - Started: % - Ended: %', 
            session_rec.id, session_rec.task_id, session_rec.is_active, 
            session_rec.started_at, session_rec.ended_at;
    END LOOP;
END $$;

-- Get a real user ID from the database
SELECT 'AVAILABLE USERS' as section;
SELECT id, email, created_at FROM auth.users LIMIT 5;

-- Check tasks with in_progress status
SELECT 'IN PROGRESS TASKS' as section;
SELECT id, title, status, current_session_id, created_by 
FROM tasks 
WHERE status = 'in_progress'
LIMIT 10;

-- Check active sessions
SELECT 'ACTIVE SESSIONS' as section;
SELECT id, task_id, user_id, is_active, started_at, ended_at
FROM task_sessions
WHERE is_active = true AND ended_at IS NULL
LIMIT 10;

-- Create a function to properly end existing sessions before starting new ones
-- This prevents the accumulation of multiple active sessions

CREATE OR REPLACE FUNCTION end_existing_sessions_for_task(p_task_id UUID, p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    sessions_ended INTEGER;
BEGIN
    -- End all active sessions for this task
    UPDATE task_sessions 
    SET 
        ended_at = NOW(),
        is_active = false,
        notes = COALESCE(notes, '') || ' [Auto-ended: new session starting]'
    WHERE task_id = p_task_id 
    AND user_id = p_user_id
    AND is_active = true 
    AND ended_at IS NULL;
    
    GET DIAGNOSTICS sessions_ended = ROW_COUNT;
    
    RETURN sessions_ended;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically end existing sessions when a new one starts
CREATE OR REPLACE FUNCTION trigger_end_existing_sessions()
RETURNS TRIGGER AS $$
BEGIN
    -- Only run for INSERT operations on active sessions
    IF TG_OP = 'INSERT' AND NEW.is_active = true THEN
        -- End any existing active sessions for this task/user combination
        PERFORM end_existing_sessions_for_task(NEW.task_id, NEW.user_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS prevent_multiple_active_sessions ON task_sessions;

-- Create the trigger
CREATE TRIGGER prevent_multiple_active_sessions
    BEFORE INSERT ON task_sessions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_end_existing_sessions();

-- Test the function
SELECT end_existing_sessions_for_task(
    '753234a0-eef0-484c-9a39-c4c997158e0a'::UUID,
    (SELECT user_id FROM task_sessions WHERE task_id = '753234a0-eef0-484c-9a39-c4c997158e0a' LIMIT 1)
) as sessions_ended;

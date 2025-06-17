-- TEMPORARY: Create a test function that bypasses auth for debugging
-- WARNING: Only use this for debugging, remove in production!

CREATE OR REPLACE FUNCTION get_active_sessions_debug(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
    session_id UUID,
    task_id UUID,
    task_title TEXT,
    task_priority TEXT,
    started_at TIMESTAMPTZ,
    duration_minutes INTEGER,
    location_context TEXT,
    is_opportunistic BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    actual_user_id UUID;
BEGIN
    -- Use provided user_id or try to get from auth, or fallback to first user
    actual_user_id := COALESCE(
        p_user_id,
        auth.uid(),
        (SELECT id FROM auth.users LIMIT 1)
    );
    
    RAISE NOTICE 'Using user_id: %', actual_user_id;
    
    RETURN QUERY
    SELECT 
        ts.id as session_id,
        t.id as task_id,
        t.title::TEXT as task_title,
        t.priority::TEXT as task_priority,
        ts.started_at,
        EXTRACT(EPOCH FROM (NOW() - ts.started_at))::INTEGER / 60 as duration_minutes,
        COALESCE(ts.location_context::TEXT, '') as location_context,
        COALESCE(t.is_opportunistic, false) as is_opportunistic
    FROM task_sessions ts
    JOIN tasks t ON ts.task_id = t.id
    WHERE ts.user_id = actual_user_id
    AND ts.is_active = true 
    AND ts.ended_at IS NULL
    ORDER BY ts.started_at DESC;
END;
$$;

-- Test the debug function
SELECT 'DEBUG TEST' as section;
SELECT * FROM get_active_sessions_debug();

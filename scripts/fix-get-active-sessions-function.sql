-- Fix the get_active_sessions function type mismatch

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS get_active_sessions(uuid);

-- Recreate the function with correct types
CREATE OR REPLACE FUNCTION get_active_sessions(p_user_id UUID)
RETURNS TABLE (
    session_id UUID,
    task_id UUID,
    task_title TEXT, -- Changed from VARCHAR(255) to TEXT
    task_priority INTEGER,
    started_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    location_context JSONB,
    is_opportunistic BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ts.id as session_id,
        t.id as task_id,
        t.title::TEXT as task_title, -- Cast to TEXT
        t.priority as task_priority,
        ts.started_at,
        EXTRACT(EPOCH FROM (NOW() - ts.started_at))::INTEGER / 60 as duration_minutes,
        ts.location_context,
        t.is_opportunistic
    FROM task_sessions ts
    JOIN tasks t ON ts.task_id = t.id
    WHERE ts.user_id = p_user_id 
    AND ts.is_active = true 
    AND ts.ended_at IS NULL
    ORDER BY ts.started_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Test the function with a specific user ID
SELECT 'FUNCTION TEST RESULTS' as section;
SELECT * FROM get_active_sessions('00000000-0000-0000-0000-000000000000'::UUID);

-- Show success message
SELECT 'Function fixed successfully!' as message;

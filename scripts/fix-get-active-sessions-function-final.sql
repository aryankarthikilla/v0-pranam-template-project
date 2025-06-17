-- Fix the get_active_sessions function with ALL correct types

-- First, let's check ALL column types to get them exactly right
SELECT 'CHECKING ALL COLUMN TYPES' as section;
SELECT 
    table_name,
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE (table_name = 'tasks' AND column_name IN ('title', 'priority', 'is_opportunistic'))
   OR (table_name = 'task_sessions' AND column_name IN ('location_context'))
ORDER BY table_name, column_name;

-- Drop the existing function
DROP FUNCTION IF EXISTS get_active_sessions(uuid);

-- Recreate the function with ALL correct types
CREATE OR REPLACE FUNCTION get_active_sessions(p_user_id UUID)
RETURNS TABLE (
    session_id UUID,
    task_id UUID,
    task_title TEXT,
    task_priority TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    location_context TEXT, -- Changed from JSONB to TEXT
    is_opportunistic BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ts.id as session_id,
        t.id as task_id,
        t.title::TEXT as task_title,
        t.priority::TEXT as task_priority,
        ts.started_at,
        EXTRACT(EPOCH FROM (NOW() - ts.started_at))::INTEGER / 60 as duration_minutes,
        ts.location_context::TEXT as location_context, -- Cast to TEXT
        t.is_opportunistic
    FROM task_sessions ts
    JOIN tasks t ON ts.task_id = t.id
    WHERE ts.user_id = p_user_id 
    AND ts.is_active = true 
    AND ts.ended_at IS NULL
    ORDER BY ts.started_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Test the function immediately
SELECT 'TESTING FUNCTION' as section;
WITH first_user AS (
    SELECT id FROM auth.users LIMIT 1
)
SELECT * FROM get_active_sessions((SELECT id FROM first_user));

SELECT 'Function fixed and tested successfully!' as message;

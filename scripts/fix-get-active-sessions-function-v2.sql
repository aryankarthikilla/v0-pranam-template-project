-- Fix the get_active_sessions function with correct types

-- First, let's check the actual column types
SELECT 'CHECKING COLUMN TYPES' as section;
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'tasks' 
AND column_name IN ('title', 'priority')
ORDER BY column_name;

SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'task_sessions' 
AND column_name IN ('location_context')
ORDER BY column_name;

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS get_active_sessions(uuid);

-- Recreate the function with correct types based on actual schema
CREATE OR REPLACE FUNCTION get_active_sessions(p_user_id UUID)
RETURNS TABLE (
    session_id UUID,
    task_id UUID,
    task_title TEXT,
    task_priority TEXT, -- Changed to TEXT since it's varchar(10)
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
        t.title::TEXT as task_title,
        t.priority::TEXT as task_priority, -- Cast to TEXT
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

-- Show success message
SELECT 'Function recreated successfully!' as message;

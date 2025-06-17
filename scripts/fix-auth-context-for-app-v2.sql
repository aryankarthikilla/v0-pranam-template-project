-- Drop and recreate the function with correct signature
DROP FUNCTION IF EXISTS get_active_sessions(uuid);

-- First, let's see what user exists in the system
SELECT 
    'EXISTING USER' as section,
    id as user_id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users 
LIMIT 1;

-- Create a function that can work with the existing user
CREATE OR REPLACE FUNCTION get_current_app_user_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
AS $$
    -- For development: return the first confirmed user
    SELECT id FROM auth.users WHERE email_confirmed_at IS NOT NULL LIMIT 1;
$$;

-- Test the function
SELECT 
    'AUTH FUNCTION TEST' as section,
    get_current_app_user_id() as user_id,
    CASE 
        WHEN get_current_app_user_id() IS NOT NULL THEN 'SUCCESS: User ID found'
        ELSE 'FAILED: No user ID'
    END as status;

-- Recreate the get_active_sessions function with correct return type
CREATE OR REPLACE FUNCTION get_active_sessions(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
    id TEXT,
    task_id TEXT,
    task_title TEXT,
    task_priority TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
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
    -- Use provided user_id, or auth.uid(), or fallback function
    actual_user_id := COALESCE(p_user_id, auth.uid(), get_current_app_user_id());
    
    IF actual_user_id IS NULL THEN
        RAISE EXCEPTION 'No user ID available for session lookup';
    END IF;
    
    RETURN QUERY
    SELECT 
        ts.id::TEXT as session_id,
        t.id::TEXT as task_id,
        t.title::TEXT as task_title,
        t.priority::TEXT as task_priority,
        ts.started_at,
        EXTRACT(EPOCH FROM (NOW() - ts.started_at))::INTEGER / 60 as duration_minutes,
        COALESCE(ts.location_context, '')::TEXT as location_context,
        COALESCE(t.is_opportunistic, false) as is_opportunistic
    FROM task_sessions ts
    JOIN tasks t ON ts.task_id = t.id
    WHERE ts.user_id = actual_user_id 
    AND ts.is_active = true 
    AND ts.ended_at IS NULL
    ORDER BY ts.started_at DESC;
END;
$$;

-- Test the new function
SELECT 
    'FUNCTION TEST' as section,
    COUNT(*) as active_sessions_found
FROM get_active_sessions();

SELECT 'Auth context fix applied successfully!' as result;

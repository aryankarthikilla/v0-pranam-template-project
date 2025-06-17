-- Check if the get_active_sessions function exists and works correctly

-- 1. Check if the function exists
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'get_active_sessions'
  AND routine_schema = 'public';

-- 2. Test the function manually with a simple query that mimics what it should do
SELECT 
    ts.id,
    ts.task_id,
    t.title as task_title,
    t.priority as task_priority,
    ts.started_at,
    EXTRACT(EPOCH FROM (NOW() - ts.started_at))/60 as duration_minutes,
    ts.location_context,
    CASE WHEN ts.session_type = 'opportunistic' THEN true ELSE false END as is_opportunistic
FROM task_sessions ts
JOIN tasks t ON ts.task_id = t.id
WHERE ts.user_id = (SELECT auth.uid())
  AND ts.is_active = true 
  AND ts.ended_at IS NULL
ORDER BY ts.started_at DESC;

-- 3. Check for any permission issues
SELECT 
    'Current user ID' as info,
    (SELECT auth.uid()) as user_id;

-- Create a stored procedure to check for orphaned tasks
-- This will be used by the Session Recovery Widget

CREATE OR REPLACE FUNCTION check_orphaned_tasks(p_user_id UUID)
RETURNS TABLE(
    task_id UUID,
    title TEXT,
    issue_type TEXT,
    current_session_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id as task_id,
        t.title,
        'Task marked as in_progress but no active sessions'::TEXT as issue_type,
        t.current_session_id
    FROM tasks t
    LEFT JOIN task_sessions ts ON t.id = ts.task_id AND ts.is_active = true AND ts.ended_at IS NULL
    WHERE t.created_by = p_user_id
    AND t.status = 'in_progress'
    GROUP BY t.id, t.title, t.current_session_id
    HAVING COUNT(ts.id) = 0;
END;
$$ LANGUAGE plpgsql;

-- Test the function
SELECT * FROM check_orphaned_tasks(
    (SELECT id FROM auth.users LIMIT 1)
);

-- Drop existing functions first
DROP FUNCTION IF EXISTS get_user_tasks(UUID);
DROP FUNCTION IF EXISTS get_user_task_stats(UUID);

-- Create the updated get_user_tasks function with ai_priority_value
CREATE OR REPLACE FUNCTION get_user_tasks(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    description TEXT,
    parent_id UUID,
    level INTEGER,
    status VARCHAR,
    priority VARCHAR,
    due_date TIMESTAMPTZ,
    is_deleted BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    completed_at TIMESTAMPTZ,
    ai_priority_value INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH user_setting AS (
        SELECT show_completed_tasks
        FROM task_settings
        WHERE user_id = p_user_id
    ), filter_interval AS (
        SELECT interval_value
        FROM completed_filters
        WHERE filter_key = (SELECT show_completed_tasks FROM user_setting)
    )
    SELECT 
        t.id,
        t.title,
        t.description,
        t.parent_id,
        t.level,
        t.status,
        t.priority,
        t.due_date,
        t.is_deleted,
        t.created_at,
        t.updated_at,
        t.created_by,
        t.updated_by,
        t.completed_at,
        t.ai_priority_value
    FROM tasks t
    WHERE t.created_by = p_user_id
      AND t.is_deleted = false
      AND (
          -- Always show non-completed tasks
          (t.status != 'completed' AND t.status != 'done')
          OR (
              -- Show completed tasks based on filter setting
              (SELECT show_completed_tasks FROM user_setting) IS NOT NULL 
              AND (SELECT show_completed_tasks FROM user_setting) != 'no' 
              AND (t.status = 'completed' OR t.status = 'done')
              AND t.completed_at IS NOT NULL
              AND (
                  -- Special handling for "Today" filter
                  ((SELECT show_completed_tasks FROM user_setting) = 'Today' AND t.completed_at >= date_trunc('day', now()))
                  -- Handle other time-based filters
                  OR ((SELECT show_completed_tasks FROM user_setting) != 'Today' 
                      AND (SELECT interval_value FROM filter_interval) IS NOT NULL 
                      AND t.completed_at >= now() - (SELECT interval_value FROM filter_interval))
              )
          )
      )
    ORDER BY 
        CASE WHEN t.status IN ('completed', 'done') THEN 1 ELSE 0 END,
        COALESCE(t.ai_priority_value, 50) DESC,
        t.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Create a simple function to get all user tasks (for dashboard stats)
CREATE OR REPLACE FUNCTION get_user_task_stats(p_user_id UUID)
RETURNS TABLE (
    total_tasks BIGINT,
    completed_tasks BIGINT,
    pending_tasks BIGINT,
    overdue_tasks BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_tasks,
        COUNT(*) FILTER (WHERE status IN ('completed', 'done')) as completed_tasks,
        COUNT(*) FILTER (WHERE status NOT IN ('completed', 'done')) as pending_tasks,
        COUNT(*) FILTER (WHERE status NOT IN ('completed', 'done') AND due_date < NOW()) as overdue_tasks
    FROM tasks 
    WHERE created_by = p_user_id AND is_deleted = false;
END;
$$ LANGUAGE plpgsql;

-- Stored procedure to retrieve tasks
-- This function will:
-- - Take user_id as input
-- - Use task_settings.show_completed_tasks to decide what tasks to fetch

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
    completed_at TIMESTAMPTZ
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
    SELECT t.id, t.title, t.description, t.parent_id, t.level, t.status, t.priority, 
           t.due_date, t.is_deleted, t.created_at, t.updated_at, t.created_by, 
           t.updated_by, t.completed_at
    FROM tasks t
    WHERE t.is_deleted = false
      AND (t.status != 'completed' AND t.status != 'done')
      OR (
          (SELECT show_completed_tasks FROM user_setting) IS NOT NULL AND (
              (SELECT show_completed_tasks FROM user_setting) != 'no' AND
              (
                  (SELECT show_completed_tasks FROM user_setting) = 'Today' AND t.completed_at >= date_trunc('day', now())
              ) OR (
                  t.completed_at >= now() - (SELECT interval_value FROM filter_interval)
              )
          )
      )
    ORDER BY t.created_at DESC;
END;
$$ LANGUAGE plpgsql;

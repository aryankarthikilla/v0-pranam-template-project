-- Create stored procedure to get filtered tasks based on user settings
CREATE OR REPLACE FUNCTION get_filtered_tasks(
    p_user_id UUID,
    p_show_completed_tasks TEXT DEFAULT 'no'
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    status TEXT,
    priority TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID,
    parent_id UUID,
    is_deleted BOOLEAN
) AS $$
DECLARE
    cutoff_time TIMESTAMP WITH TIME ZONE;
    current_time TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
    -- Calculate cutoff time based on the setting
    CASE p_show_completed_tasks
        WHEN 'no' THEN
            cutoff_time := NULL;
        WHEN 'last_10_min' THEN
            cutoff_time := current_time - INTERVAL '10 minutes';
        WHEN 'last_30_min' THEN
            cutoff_time := current_time - INTERVAL '30 minutes';
        WHEN 'last_1_hour' THEN
            cutoff_time := current_time - INTERVAL '1 hour';
        WHEN 'last_6_hours' THEN
            cutoff_time := current_time - INTERVAL '6 hours';
        WHEN 'today' THEN
            cutoff_time := DATE_TRUNC('day', current_time);
        WHEN 'yesterday' THEN
            cutoff_time := DATE_TRUNC('day', current_time) - INTERVAL '1 day';
        WHEN 'this_week' THEN
            cutoff_time := DATE_TRUNC('week', current_time);
        WHEN 'this_month' THEN
            cutoff_time := DATE_TRUNC('month', current_time);
        WHEN 'all' THEN
            cutoff_time := '1970-01-01'::TIMESTAMP WITH TIME ZONE;
        ELSE
            cutoff_time := NULL;
    END CASE;

    -- Log the filtering parameters (for debugging)
    RAISE NOTICE 'Filtering tasks for user: %, setting: %, cutoff: %', p_user_id, p_show_completed_tasks, cutoff_time;

    -- Return filtered tasks
    IF p_show_completed_tasks = 'no' THEN
        -- Hide all completed tasks
        RETURN QUERY
        SELECT 
            t.id, t.title, t.description, t.status, t.priority, 
            t.due_date, t.completed_at, t.created_at, t.updated_at,
            t.created_by, t.updated_by, t.parent_id, t.is_deleted
        FROM tasks t
        WHERE t.is_deleted = false 
        AND t.status != 'completed'
        ORDER BY t.created_at DESC;
        
    ELSIF cutoff_time IS NOT NULL THEN
        -- Show non-completed tasks + completed tasks within time range
        RETURN QUERY
        SELECT 
            t.id, t.title, t.description, t.status, t.priority, 
            t.due_date, t.completed_at, t.created_at, t.updated_at,
            t.created_by, t.updated_by, t.parent_id, t.is_deleted
        FROM tasks t
        WHERE t.is_deleted = false 
        AND (
            t.status != 'completed' 
            OR 
            (t.status = 'completed' AND t.completed_at >= cutoff_time)
        )
        ORDER BY t.created_at DESC;
        
    ELSE
        -- Show all tasks (including all completed tasks)
        RETURN QUERY
        SELECT 
            t.id, t.title, t.description, t.status, t.priority, 
            t.due_date, t.completed_at, t.created_at, t.updated_at,
            t.created_by, t.updated_by, t.parent_id, t.is_deleted
        FROM tasks t
        WHERE t.is_deleted = false
        ORDER BY t.created_at DESC;
    END IF;

END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_filtered_tasks(UUID, TEXT) TO authenticated;

-- Create a wrapper function that automatically gets user settings
CREATE OR REPLACE FUNCTION get_user_filtered_tasks(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    status TEXT,
    priority TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID,
    parent_id UUID,
    is_deleted BOOLEAN
) AS $$
DECLARE
    user_setting TEXT;
BEGIN
    -- Get user's task settings
    SELECT COALESCE(ts.show_completed_tasks, 'no')
    INTO user_setting
    FROM task_settings ts
    WHERE ts.user_id = p_user_id;
    
    -- If no settings found, use default
    IF user_setting IS NULL THEN
        user_setting := 'no';
    END IF;
    
    RAISE NOTICE 'User % has setting: %', p_user_id, user_setting;
    
    -- Call the main filtering function
    RETURN QUERY
    SELECT * FROM get_filtered_tasks(p_user_id, user_setting);
    
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_filtered_tasks(UUID) TO authenticated;

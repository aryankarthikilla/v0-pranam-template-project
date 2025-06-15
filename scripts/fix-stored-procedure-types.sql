-- Drop and recreate the stored procedure with correct data types
DROP FUNCTION IF EXISTS get_user_tasks_filtered(UUID);

-- First, let's check the actual column types in the tasks table
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'tasks' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Create the stored procedure with correct data types matching the tasks table
CREATE OR REPLACE FUNCTION get_user_tasks_filtered(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    description TEXT,
    status VARCHAR(50),
    priority VARCHAR(50),
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
    cutoff_time TIMESTAMP WITH TIME ZONE;
    current_time TIMESTAMP WITH TIME ZONE := NOW();
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
    
    -- Log what we're doing
    RAISE NOTICE 'User: %, Setting: %, Current time: %', p_user_id, user_setting, current_time;
    
    -- Calculate cutoff time
    CASE user_setting
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
    
    RAISE NOTICE 'Cutoff time calculated: %', cutoff_time;
    
    -- Apply filtering and return results
    IF user_setting = 'no' THEN
        -- Hide all completed tasks
        RAISE NOTICE 'Hiding all completed tasks';
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
        -- Show non-completed + recent completed tasks
        RAISE NOTICE 'Showing non-completed tasks + completed tasks after: %', cutoff_time;
        
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
            (t.status = 'completed' AND t.completed_at IS NOT NULL AND t.completed_at >= cutoff_time)
        )
        ORDER BY t.created_at DESC;
        
    ELSE
        -- Show all tasks
        RAISE NOTICE 'Showing all tasks';
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_tasks_filtered(UUID) TO authenticated;

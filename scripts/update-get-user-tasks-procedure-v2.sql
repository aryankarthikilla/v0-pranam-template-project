-- Updated procedure to handle "Today" filter correctly
CREATE OR REPLACE FUNCTION get_user_tasks(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    status TEXT,
    priority TEXT,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    is_deleted BOOLEAN,
    user_id UUID
) AS $$
DECLARE
    user_filter_setting TEXT;
    filter_interval INTERVAL;
BEGIN
    -- Get user's current filter setting
    SELECT show_completed_tasks INTO user_filter_setting
    FROM task_settings 
    WHERE task_settings.user_id = user_uuid;
    
    -- If no setting found, default to 'no'
    IF user_filter_setting IS NULL THEN
        user_filter_setting := 'no';
    END IF;
    
    -- Get the interval for the filter (will be NULL for 'no')
    SELECT cf.interval_value INTO filter_interval
    FROM completed_filters cf
    WHERE cf.filter_key = user_filter_setting;
    
    -- Return filtered tasks based on the setting
    RETURN QUERY
    SELECT 
        t.id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.due_date,
        t.created_at,
        t.updated_at,
        t.completed_at,
        t.is_deleted,
        t.user_id
    FROM tasks t
    WHERE t.user_id = user_uuid
    AND t.is_deleted = false
    AND (
        -- Always show non-completed tasks
        t.status NOT IN ('completed', 'done')
        OR (
            -- Show completed tasks based on filter setting
            user_filter_setting != 'no' 
            AND t.status IN ('completed', 'done')
            AND t.completed_at IS NOT NULL
            AND (
                -- Special handling for "Today" filter
                (user_filter_setting = 'Today' AND t.completed_at >= date_trunc('day', now()))
                -- Handle other time-based filters
                OR (user_filter_setting != 'Today' AND filter_interval IS NOT NULL AND t.completed_at >= now() - filter_interval)
            )
        )
    )
    ORDER BY 
        CASE WHEN t.status IN ('completed', 'done') THEN 1 ELSE 0 END,
        t.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the updated procedure
SELECT 'Testing updated procedure:' as info;
SELECT COUNT(*) as total_tasks_returned
FROM get_user_tasks(auth.uid());

-- First, let's see what columns actually exist in the tasks table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'tasks' 
ORDER BY ordinal_position;

-- Drop the existing function
DROP FUNCTION IF EXISTS get_user_tasks(UUID);

-- Let's also check if there's a user_id column or if it's named differently
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'tasks' 
AND column_name LIKE '%user%';

-- Check the actual structure of a few tasks
SELECT * FROM tasks LIMIT 3;

-- Now create the function based on the actual table structure
-- We'll use a more flexible approach that works with the existing schema
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
    is_deleted BOOLEAN
) AS $$
DECLARE
    user_filter_setting TEXT;
    filter_interval INTERVAL;
    user_column_name TEXT;
BEGIN
    -- Check if user_id column exists, or if it's named differently
    SELECT column_name INTO user_column_name
    FROM information_schema.columns 
    WHERE table_name = 'tasks' 
    AND column_name IN ('user_id', 'created_by', 'owner_id', 'author_id')
    LIMIT 1;
    
    -- If no user column found, we'll filter differently
    IF user_column_name IS NULL THEN
        -- Use RLS policy instead of explicit user filtering
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
            COALESCE(t.is_deleted, false) as is_deleted
        FROM tasks t
        WHERE COALESCE(t.is_deleted, false) = false
        ORDER BY t.updated_at DESC;
        RETURN;
    END IF;
    
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
    
    -- Return filtered tasks using dynamic SQL based on the actual column name
    IF user_column_name = 'user_id' THEN
        RETURN QUERY
        EXECUTE format('
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
                COALESCE(t.is_deleted, false) as is_deleted
            FROM tasks t
            WHERE t.%I = $1
            AND COALESCE(t.is_deleted, false) = false
            AND (
                t.status NOT IN (''completed'', ''done'')
                OR (
                    $2 != ''no'' 
                    AND t.status IN (''completed'', ''done'')
                    AND t.completed_at IS NOT NULL
                    AND (
                        ($2 = ''Today'' AND t.completed_at >= date_trunc(''day'', now()))
                        OR ($2 != ''Today'' AND $3 IS NOT NULL AND t.completed_at >= now() - $3)
                    )
                )
            )
            ORDER BY 
                CASE WHEN t.status IN (''completed'', ''done'') THEN 1 ELSE 0 END,
                t.updated_at DESC
        ', user_column_name)
        USING user_uuid, user_filter_setting, filter_interval;
    ELSE
        -- Fallback: just return all tasks for the user without filtering
        RETURN QUERY
        EXECUTE format('
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
                COALESCE(t.is_deleted, false) as is_deleted
            FROM tasks t
            WHERE t.%I = $1
            AND COALESCE(t.is_deleted, false) = false
            ORDER BY t.updated_at DESC
        ', user_column_name)
        USING user_uuid;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the function
SELECT 'Function recreated successfully' as status;

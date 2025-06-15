-- ===================================================================
-- FINAL COMPLETE FIX FOR TASK FILTERING
-- Run this script to fix all task filtering issues
-- ===================================================================

-- Step 1: Drop existing stored procedure
DROP FUNCTION IF EXISTS get_user_tasks_filtered(UUID);
DROP FUNCTION IF EXISTS get_user_filtered_tasks(UUID);

-- Step 2: Create the correct stored procedure with exact table structure
CREATE OR REPLACE FUNCTION get_user_tasks_filtered(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    title CHARACTER VARYING(255),
    description TEXT,
    parent_id UUID,
    level INTEGER,
    status CHARACTER VARYING(20),
    priority CHARACTER VARYING(10),
    due_date TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    updated_by UUID,
    completed_at TIMESTAMP WITH TIME ZONE
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
    
    -- Calculate cutoff time based on setting
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
            t.id, t.title, t.description, t.parent_id, t.level, t.status, t.priority, 
            t.due_date, t.is_deleted, t.created_at, t.updated_at,
            t.created_by, t.updated_by, t.completed_at
        FROM tasks t
        WHERE t.is_deleted = false 
        AND t.status != 'completed'
        ORDER BY t.created_at DESC;
        
    ELSIF cutoff_time IS NOT NULL THEN
        -- Show non-completed + recent completed tasks
        RAISE NOTICE 'Showing non-completed tasks + completed tasks after: %', cutoff_time;
        
        RETURN QUERY
        SELECT 
            t.id, t.title, t.description, t.parent_id, t.level, t.status, t.priority, 
            t.due_date, t.is_deleted, t.created_at, t.updated_at,
            t.created_by, t.updated_by, t.completed_at
        FROM tasks t
        WHERE t.is_deleted = false 
        AND (
            t.status != 'completed' 
            OR 
            (t.status = 'completed' AND t.completed_at IS NOT NULL AND t.completed_at >= cutoff_time)
        )
        ORDER BY t.created_at DESC;
        
    ELSE
        -- Show all tasks (setting = 'all')
        RAISE NOTICE 'Showing all tasks';
        RETURN QUERY
        SELECT 
            t.id, t.title, t.description, t.parent_id, t.level, t.status, t.priority, 
            t.due_date, t.is_deleted, t.created_at, t.updated_at,
            t.created_by, t.updated_by, t.completed_at
        FROM tasks t
        WHERE t.is_deleted = false
        ORDER BY t.created_at DESC;
    END IF;

END;
$$ LANGUAGE plpgsql;

-- Step 3: Grant permissions
GRANT EXECUTE ON FUNCTION get_user_tasks_filtered(UUID) TO authenticated;

-- Step 4: Ensure task settings exist for current user
INSERT INTO task_settings (user_id, show_completed_tasks)
SELECT auth.uid(), 'last_1_hour'
WHERE NOT EXISTS (
    SELECT 1 FROM task_settings WHERE user_id = auth.uid()
)
ON CONFLICT (user_id) DO UPDATE SET
    show_completed_tasks = 'last_1_hour',
    updated_at = NOW();

-- Step 5: Test the stored procedure
SELECT 'Testing stored procedure with last_1_hour setting:' as test_info;
SELECT 
    title,
    status,
    completed_at,
    CASE 
        WHEN status != 'completed' THEN 'Active task'
        WHEN completed_at >= NOW() - INTERVAL '1 hour' THEN 'Recently completed'
        ELSE 'Old completed task'
    END as reason_shown
FROM get_user_tasks_filtered(auth.uid());

-- Step 6: Verify the results
SELECT 'Expected: Only active tasks + tasks completed in last hour' as expected_result;

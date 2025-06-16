-- Complete setup script for the new task filtering system
-- Run this script to set up the entire filtering infrastructure

-- Step 1: Create completed_filters table
CREATE TABLE IF NOT EXISTS completed_filters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filter_key VARCHAR NOT NULL UNIQUE,
    interval_value INTERVAL NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Insert filter options
INSERT INTO completed_filters (filter_key, interval_value) VALUES
('no', INTERVAL '0 seconds'), -- Special case for no completed tasks
('5 min', INTERVAL '5 minutes'),
('10 min', INTERVAL '10 minutes'),
('30 min', INTERVAL '30 minutes'),
('1 hour', INTERVAL '1 hour'),
('2 hours', INTERVAL '2 hours'),
('3 hours', INTERVAL '3 hours'),
('6 hours', INTERVAL '6 hours'),
('12 hours', INTERVAL '12 hours'),
('Today', INTERVAL '1 day'), -- Will be handled specially in procedure
('2 days', INTERVAL '2 days'),
('3 days', INTERVAL '3 days'),
('1 week', INTERVAL '1 week'),
('1 month', INTERVAL '1 month'),
('3 months', INTERVAL '3 months'),
('1 year', INTERVAL '1 year'),
('all', INTERVAL '100 years') -- Special case for all completed tasks
ON CONFLICT (filter_key) DO NOTHING;

-- Step 3: Create the stored procedure
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
DECLARE
    user_filter VARCHAR;
    filter_interval_val INTERVAL;
BEGIN
    -- Get user's filter setting
    SELECT show_completed_tasks INTO user_filter
    FROM task_settings
    WHERE user_id = p_user_id;
    
    -- If no setting found, default to 'no'
    IF user_filter IS NULL THEN
        user_filter := 'no';
    END IF;
    
    -- Get the interval for this filter
    SELECT interval_value INTO filter_interval_val
    FROM completed_filters
    WHERE filter_key = user_filter;
    
    -- If filter not found, default to 'no' (0 seconds)
    IF filter_interval_val IS NULL THEN
        filter_interval_val := INTERVAL '0 seconds';
        user_filter := 'no';
    END IF;
    
    -- Return filtered tasks
    RETURN QUERY
    SELECT t.id, t.title, t.description, t.parent_id, t.level, t.status, t.priority, 
           t.due_date, t.is_deleted, t.created_at, t.updated_at, t.created_by, 
           t.updated_by, t.completed_at
    FROM tasks t
    WHERE t.is_deleted = false
      AND (
          -- Always show non-completed tasks
          (t.status != 'completed' AND t.status != 'done')
          OR
          -- Show completed tasks based on filter
          (
              (t.status = 'completed' OR t.status = 'done') AND
              CASE 
                  WHEN user_filter = 'no' THEN FALSE
                  WHEN user_filter = 'all' THEN TRUE
                  WHEN user_filter = 'Today' THEN t.completed_at >= date_trunc('day', now())
                  ELSE t.completed_at >= (now() - filter_interval_val)
              END
          )
      )
    ORDER BY t.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Verify the setup
SELECT 'Setup completed successfully!' as status;
SELECT 'Available filters:' as info;
SELECT filter_key, interval_value FROM completed_filters ORDER BY interval_value;

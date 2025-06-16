-- Create a test completed task to verify filtering works
DO $$
DECLARE
    test_user_id UUID;
    test_task_id UUID;
    user_column_name TEXT;
BEGIN
    -- Get a user ID from task_settings
    SELECT user_id INTO test_user_id FROM task_settings LIMIT 1;
    
    -- Check what column name is used for user reference in tasks
    SELECT column_name INTO user_column_name
    FROM information_schema.columns 
    WHERE table_name = 'tasks' 
    AND column_name IN ('user_id', 'created_by', 'owner_id')
    LIMIT 1;
    
    IF test_user_id IS NOT NULL AND user_column_name IS NOT NULL THEN
        -- Create a test task
        EXECUTE format('
            INSERT INTO tasks (title, description, status, priority, %I, completed_at, is_deleted)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        ', user_column_name)
        USING 
            'Test Completed Task - ' || to_char(now(), 'HH24:MI:SS'),
            'This is a test task to verify filtering works',
            'completed',
            'medium',
            test_user_id,
            now() - interval '30 minutes', -- Completed 30 minutes ago
            false
        INTO test_task_id;
        
        RAISE NOTICE 'Created test completed task with ID: %', test_task_id;
        RAISE NOTICE 'Task was completed 30 minutes ago for user: %', test_user_id;
        
        -- Test the filtering
        RAISE NOTICE 'Testing filters:';
        
        -- Set to show last 1 hour (should include our task)
        UPDATE task_settings SET show_completed_tasks = '1 hour' WHERE user_id = test_user_id;
        RAISE NOTICE 'With "1 hour" filter: % tasks returned', 
            (SELECT COUNT(*) FROM get_user_tasks(test_user_id));
        
        -- Set to show last 10 minutes (should NOT include our task)
        UPDATE task_settings SET show_completed_tasks = '10 min' WHERE user_id = test_user_id;
        RAISE NOTICE 'With "10 min" filter: % tasks returned', 
            (SELECT COUNT(*) FROM get_user_tasks(test_user_id));
        
        -- Set to no completed tasks
        UPDATE task_settings SET show_completed_tasks = 'no' WHERE user_id = test_user_id;
        RAISE NOTICE 'With "no" filter: % tasks returned', 
            (SELECT COUNT(*) FROM get_user_tasks(test_user_id));
            
    ELSE
        RAISE NOTICE 'Could not find test user or determine user column name';
        RAISE NOTICE 'User ID: %, Column: %', test_user_id, user_column_name;
    END IF;
END $$;

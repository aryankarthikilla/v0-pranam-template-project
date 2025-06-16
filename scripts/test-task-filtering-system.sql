-- Test the complete task filtering system
SELECT '=== TESTING TASK FILTERING SYSTEM ===' as test_phase;

-- 1. Check what columns actually exist in tasks table
SELECT '1. Tasks table structure:' as step;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tasks' 
AND column_name IN ('id', 'title', 'status', 'created_by', 'user_id', 'completed_at', 'is_deleted')
ORDER BY column_name;

-- 2. Check completed_filters table
SELECT '2. Available completed filters:' as step;
SELECT filter_key, interval_value FROM completed_filters ORDER BY filter_key;

-- 3. Check current task settings for users
SELECT '3. Current task settings:' as step;
SELECT user_id, show_completed_tasks FROM task_settings LIMIT 5;

-- 4. Check some sample tasks
SELECT '4. Sample tasks:' as step;
SELECT id, title, status, completed_at, 
       CASE WHEN completed_at IS NOT NULL THEN 'Has completed_at' ELSE 'No completed_at' END as completion_status
FROM tasks 
WHERE is_deleted = false 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Test the function with a real user
SELECT '5. Testing get_user_tasks function:' as step;
DO $$
DECLARE
    test_user_id UUID;
    task_count INTEGER;
BEGIN
    -- Get a real user ID from task_settings
    SELECT user_id INTO test_user_id FROM task_settings LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Test the function
        SELECT COUNT(*) INTO task_count FROM get_user_tasks(test_user_id);
        RAISE NOTICE 'Function returned % tasks for user %', task_count, test_user_id;
        
        -- Show the actual results
        RAISE NOTICE 'Sample results:';
        PERFORM id, title, status FROM get_user_tasks(test_user_id) LIMIT 3;
    ELSE
        RAISE NOTICE 'No users found in task_settings table';
    END IF;
END $$;

-- 6. Test different filter settings
SELECT '6. Testing filter behavior:' as step;
DO $$
DECLARE
    test_user_id UUID;
    original_setting TEXT;
BEGIN
    -- Get a user to test with
    SELECT user_id, show_completed_tasks INTO test_user_id, original_setting 
    FROM task_settings LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Test with 'no' setting
        UPDATE task_settings SET show_completed_tasks = 'no' WHERE user_id = test_user_id;
        RAISE NOTICE 'With "no" setting: % tasks', (SELECT COUNT(*) FROM get_user_tasks(test_user_id));
        
        -- Test with '1 hour' setting
        UPDATE task_settings SET show_completed_tasks = '1 hour' WHERE user_id = test_user_id;
        RAISE NOTICE 'With "1 hour" setting: % tasks', (SELECT COUNT(*) FROM get_user_tasks(test_user_id));
        
        -- Restore original setting
        UPDATE task_settings SET show_completed_tasks = original_setting WHERE user_id = test_user_id;
        RAISE NOTICE 'Restored original setting: %', original_setting;
    END IF;
END $$;

SELECT '=== TEST COMPLETE ===' as test_phase;

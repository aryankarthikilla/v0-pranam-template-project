-- Create a test task and complete it with current timestamp
INSERT INTO tasks (
    title, 
    description, 
    status, 
    priority, 
    completed_at,
    created_by, 
    updated_by,
    created_at,
    updated_at
) VALUES (
    'Test Task - Just Completed',
    'This task was just completed for testing',
    'completed',
    'medium',
    NOW(), -- Set completed_at to right now
    (SELECT auth.uid()), -- Current user
    (SELECT auth.uid()), -- Current user  
    NOW(),
    NOW()
);

-- Verify the test task
SELECT 
    title,
    status,
    completed_at,
    NOW() - completed_at as time_since_completion,
    CASE 
        WHEN completed_at >= NOW() - INTERVAL '1 hour' THEN 'SHOULD_SHOW'
        ELSE 'SHOULD_HIDE'
    END as visibility_test
FROM tasks 
WHERE title = 'Test Task - Just Completed';

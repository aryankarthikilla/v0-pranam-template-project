-- Check current state of completed tasks
SELECT 
    id, 
    title, 
    status, 
    completed_at, 
    updated_at, 
    created_at
FROM tasks 
WHERE status = 'completed' 
ORDER BY updated_at DESC;

-- Update completed tasks that don't have completed_at set
-- Set completed_at to updated_at for completed tasks that are missing completed_at
UPDATE tasks 
SET completed_at = updated_at 
WHERE status = 'completed' 
AND completed_at IS NULL;

-- Verify the update
SELECT 
    id, 
    title, 
    status, 
    completed_at, 
    updated_at, 
    created_at
FROM tasks 
WHERE status = 'completed' 
ORDER BY completed_at DESC;

-- Update completed tasks that don't have completed_at set
-- Use updated_at as a fallback for completed_at
UPDATE tasks 
SET completed_at = updated_at 
WHERE status = 'completed' 
AND completed_at IS NULL 
AND is_deleted = false;

-- Show what we updated
SELECT 
    title,
    status,
    completed_at,
    updated_at,
    'FIXED' as action
FROM tasks 
WHERE status = 'completed' 
AND is_deleted = false
ORDER BY updated_at DESC;

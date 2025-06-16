-- Clean up duplicate active schedules and keep only the latest one per task

WITH ranked_schedules AS (
  SELECT 
    id,
    task_id,
    user_id,
    ROW_NUMBER() OVER (
      PARTITION BY task_id, user_id 
      ORDER BY created_at DESC
    ) as rn
  FROM task_schedules 
  WHERE is_active = true
)
UPDATE task_schedules 
SET is_active = false 
WHERE id IN (
  SELECT id 
  FROM ranked_schedules 
  WHERE rn > 1
);

-- Show remaining active schedules
SELECT 
  ts.id,
  t.title as task_title,
  ts.scheduled_for,
  ts.reason,
  ts.is_active,
  ts.created_at
FROM task_schedules ts
JOIN tasks t ON ts.task_id = t.id
WHERE ts.is_active = true
ORDER BY ts.created_at DESC;

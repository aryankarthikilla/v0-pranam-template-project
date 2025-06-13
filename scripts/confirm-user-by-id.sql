-- Script to confirm a user by their UUID
-- Replace 'your-user-uuid-here' with the actual user ID

UPDATE auth.users 
SET 
  email_confirmed_at = NOW()
WHERE id = 'your-user-uuid-here'::uuid
AND email_confirmed_at IS NULL;

-- Check the result
SELECT 
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN 'Confirmed'
    ELSE 'Not Confirmed'
  END as status
FROM auth.users 
WHERE id = 'your-user-uuid-here'::uuid;

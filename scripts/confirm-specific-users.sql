-- Script to confirm multiple specific users by email
-- Add or remove emails as needed

UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email IN (
  'user1@example.com',
  'user2@example.com',
  'user3@example.com'
) 
AND email_confirmed_at IS NULL;

-- Check the results
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
WHERE email IN (
  'user1@example.com',
  'user2@example.com',
  'user3@example.com'
)
ORDER BY email;

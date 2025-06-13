-- Script to reset a user's confirmation status (for testing)
-- Replace 'user@example.com' with the email you want to reset

UPDATE auth.users 
SET 
  email_confirmed_at = NULL
WHERE email = 'user@example.com';

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
WHERE email = 'user@example.com';

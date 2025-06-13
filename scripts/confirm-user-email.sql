-- Script to confirm a user's email address
-- Replace 'user@example.com' with the actual email address you want to confirm

UPDATE auth.users 
SET 
  email_confirmed_at = NOW()
WHERE email = 'user@example.com'
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
WHERE email = 'user@example.com';

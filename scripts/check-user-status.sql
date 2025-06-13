-- Script to check user confirmation status
-- Replace 'user@example.com' with the email you want to check

SELECT 
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  last_sign_in_at,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN 'Confirmed'
    ELSE 'Not Confirmed'
  END as status
FROM auth.users 
WHERE email = 'user@example.com';

-- Or check all users and their status
SELECT 
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  last_sign_in_at,
  created_at,
  CASE 
    WHEN email_confirmed_at IS NOT NULL THEN 'Confirmed'
    ELSE 'Not Confirmed'
  END as status
FROM auth.users 
ORDER BY created_at DESC
LIMIT 20;

-- Script to confirm all unconfirmed users (use with caution!)
-- This will confirm ALL users who haven't been confirmed yet

UPDATE auth.users 
SET 
  email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Show all users and their confirmation status
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
ORDER BY created_at DESC;

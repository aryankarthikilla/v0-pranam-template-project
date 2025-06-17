-- Check authentication setup and provide solutions
SELECT 
    'AUTH DIAGNOSTICS' as section,
    CASE 
        WHEN auth.uid() IS NULL THEN 'ISSUE: No authenticated user'
        ELSE 'SUCCESS: User authenticated as ' || auth.uid()::TEXT
    END as auth_status;

-- Check if there are any users in the system
SELECT 
    'USER COUNT' as section,
    COUNT(*) as total_users,
    COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as confirmed_users
FROM auth.users;

-- Check current session info
SELECT 
    'SESSION INFO' as section,
    current_user as database_user,
    current_database() as database_name,
    inet_client_addr() as client_ip;

-- Check if RLS is enabled on tasks table
SELECT 
    'RLS STATUS' as section,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('tasks', 'task_sessions', 'profiles')
AND schemaname = 'public';

-- Provide solutions
SELECT 
    'SOLUTIONS' as section,
    'If auth.uid() is NULL, you need to:
1. Make sure you are logged in to your app
2. Check that your session cookies are valid
3. Verify your Supabase client is configured correctly
4. For server-side functions, use createServerClient with proper auth context' as recommendations;

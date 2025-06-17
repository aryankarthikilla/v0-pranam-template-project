-- Fix RLS Policies for Development Environment
-- This will allow proper access to task_sessions while maintaining security

-- First, let's see current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('tasks', 'task_sessions', 'profiles')
ORDER BY tablename, policyname;

-- Drop existing restrictive policies on task_sessions if they exist
DROP POLICY IF EXISTS "Users can only see own task_sessions" ON task_sessions;
DROP POLICY IF EXISTS "Users can only insert own task_sessions" ON task_sessions;
DROP POLICY IF EXISTS "Users can only update own task_sessions" ON task_sessions;

-- Create more permissive policies for development
-- Allow users to see their own task sessions
CREATE POLICY "Enable read access for authenticated users" ON task_sessions
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND 
        user_id = auth.uid()
    );

-- Allow users to insert their own task sessions
CREATE POLICY "Enable insert access for authenticated users" ON task_sessions
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND 
        user_id = auth.uid()
    );

-- Allow users to update their own task sessions
CREATE POLICY "Enable update access for authenticated users" ON task_sessions
    FOR UPDATE USING (
        auth.uid() IS NOT NULL AND 
        user_id = auth.uid()
    ) WITH CHECK (
        auth.uid() IS NOT NULL AND 
        user_id = auth.uid()
    );

-- Ensure tasks table has proper RLS policies too
-- Enable RLS on tasks if not already enabled
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on tasks if they exist
DROP POLICY IF EXISTS "Users can only see own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can only insert own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can only update own tasks" ON tasks;

-- Create policies for tasks
CREATE POLICY "Enable read access for authenticated users on tasks" ON tasks
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND 
        created_by = auth.uid()
    );

CREATE POLICY "Enable insert access for authenticated users on tasks" ON tasks
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL AND 
        created_by = auth.uid()
    );

CREATE POLICY "Enable update access for authenticated users on tasks" ON tasks
    FOR UPDATE USING (
        auth.uid() IS NOT NULL AND 
        created_by = auth.uid()
    ) WITH CHECK (
        auth.uid() IS NOT NULL AND 
        created_by = auth.uid()
    );

-- Test the policies
SELECT 'RLS Policies Updated Successfully!' as message;

-- Show current policies after update
SELECT 
    'UPDATED POLICIES' as section,
    schemaname, 
    tablename, 
    policyname, 
    cmd as operation
FROM pg_policies 
WHERE tablename IN ('tasks', 'task_sessions')
ORDER BY tablename, policyname;

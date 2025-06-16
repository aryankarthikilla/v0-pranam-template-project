-- Ensure task_settings table exists with correct structure
DROP TABLE IF EXISTS task_settings CASCADE;

CREATE TABLE task_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    show_completed_tasks TEXT NOT NULL DEFAULT 'no',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE task_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own settings
CREATE POLICY "Users can manage their own task settings" ON task_settings
    FOR ALL USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON task_settings TO authenticated;

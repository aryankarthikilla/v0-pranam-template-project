-- Step 1: Add new columns to existing tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS context_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS location_context VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_opportunistic BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS current_session_id UUID,
ADD COLUMN IF NOT EXISTS ai_priority_value INTEGER;

-- Update existing tasks with default estimated time
UPDATE tasks 
SET estimated_minutes = 10 
WHERE estimated_minutes IS NULL;

-- Create task_notes table (simple version first)
CREATE TABLE IF NOT EXISTS task_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    note_text TEXT NOT NULL,
    note_type VARCHAR(50) DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on task_notes
ALTER TABLE task_notes ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for task_notes
CREATE POLICY "Users can manage their own task notes" ON task_notes
    FOR ALL USING (auth.uid() = user_id);

-- Create simple index for performance
CREATE INDEX IF NOT EXISTS idx_task_notes_task_id ON task_notes(task_id);
CREATE INDEX IF NOT EXISTS idx_task_notes_user_id ON task_notes(user_id);

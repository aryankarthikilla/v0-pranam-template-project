-- Enhanced Task System Database Schema
-- Phase 1: Core Multi-Task System

-- Add new columns to existing tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS context_type VARCHAR(50) DEFAULT 'general',
ADD COLUMN IF NOT EXISTS location_context VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_opportunistic BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES tasks(id),
ADD COLUMN IF NOT EXISTS current_session_id UUID,
ADD COLUMN IF NOT EXISTS total_time_spent INTEGER DEFAULT 0; -- in minutes

-- Task Sessions (for multi-task support and time tracking)
CREATE TABLE IF NOT EXISTS task_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    session_type VARCHAR(20) NOT NULL DEFAULT 'work', -- work, break, pause
    location_context VARCHAR(100),
    device_context VARCHAR(50), -- mobile, desktop, tablet
    is_active BOOLEAN DEFAULT TRUE,
    duration_minutes INTEGER, -- calculated on end
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task Notes (user's brilliant idea!)
CREATE TABLE IF NOT EXISTS task_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    note_text TEXT NOT NULL,
    note_type VARCHAR(20) DEFAULT 'general', -- general, pause_reason, completion_note, context_update
    session_id UUID REFERENCES task_sessions(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task Context Tracking (for AI learning)
CREATE TABLE IF NOT EXISTS task_contexts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    context_type VARCHAR(50) NOT NULL, -- location, device, time_of_day, situation
    context_value VARCHAR(100) NOT NULL,
    effectiveness_score INTEGER, -- 1-10, how well task was completed in this context
    session_id UUID REFERENCES task_sessions(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Productivity Patterns (AI learning data)
CREATE TABLE IF NOT EXISTS productivity_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pattern_type VARCHAR(50) NOT NULL, -- time_of_day, task_type, context, duration
    pattern_key VARCHAR(100) NOT NULL, -- morning, coding, home, 30min
    pattern_value JSONB NOT NULL, -- flexible data storage
    success_rate DECIMAL(5,2), -- percentage
    avg_completion_time INTEGER, -- minutes
    sample_size INTEGER DEFAULT 1,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, pattern_type, pattern_key)
);

-- Task Schedules (for skip/reschedule functionality)
CREATE TABLE IF NOT EXISTS task_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    schedule_type VARCHAR(20) NOT NULL, -- skip, reschedule, reminder
    duration_minutes INTEGER,
    reason TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Smart Notifications Queue
CREATE TABLE IF NOT EXISTS notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    is_read BOOLEAN DEFAULT FALSE,
    action_data JSONB, -- flexible action data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Google Calendar Integration
CREATE TABLE IF NOT EXISTS calendar_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider VARCHAR(20) NOT NULL DEFAULT 'google',
    access_token TEXT,
    refresh_token TEXT,
    calendar_id VARCHAR(200),
    sync_enabled BOOLEAN DEFAULT TRUE,
    last_sync TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task Calendar Events (sync tracking)
CREATE TABLE IF NOT EXISTS task_calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    calendar_event_id VARCHAR(200),
    provider VARCHAR(20) DEFAULT 'google',
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_sessions_user_active ON task_sessions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_task_sessions_task_started ON task_sessions(task_id, started_at);
CREATE INDEX IF NOT EXISTS idx_task_notes_task_created ON task_notes(task_id, created_at);
CREATE INDEX IF NOT EXISTS idx_task_contexts_user_type ON task_contexts(user_id, context_type);
CREATE INDEX IF NOT EXISTS idx_productivity_patterns_user_type ON productivity_patterns(user_id, pattern_type);
CREATE INDEX IF NOT EXISTS idx_task_schedules_user_scheduled ON task_schedules(user_id, scheduled_for, is_active);
CREATE INDEX IF NOT EXISTS idx_notification_queue_user_scheduled ON notification_queue(user_id, scheduled_for, sent_at);

-- Update existing tasks with default estimated_minutes
UPDATE tasks SET estimated_minutes = 10 WHERE estimated_minutes IS NULL;

-- RLS Policies
ALTER TABLE task_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE productivity_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_calendar_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for task_sessions
CREATE POLICY "Users can manage their own task sessions" ON task_sessions
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for task_notes
CREATE POLICY "Users can manage their own task notes" ON task_notes
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for task_contexts
CREATE POLICY "Users can manage their own task contexts" ON task_contexts
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for productivity_patterns
CREATE POLICY "Users can manage their own productivity patterns" ON productivity_patterns
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for task_schedules
CREATE POLICY "Users can manage their own task schedules" ON task_schedules
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for notification_queue
CREATE POLICY "Users can manage their own notifications" ON notification_queue
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for calendar_integrations
CREATE POLICY "Users can manage their own calendar integrations" ON calendar_integrations
    FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for task_calendar_events
CREATE POLICY "Users can manage their own task calendar events" ON task_calendar_events
    FOR ALL USING (auth.uid() = user_id);

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_task_total_time()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total time spent when session ends
    IF NEW.ended_at IS NOT NULL AND OLD.ended_at IS NULL THEN
        NEW.duration_minutes = EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at)) / 60;
        
        UPDATE tasks 
        SET total_time_spent = COALESCE(total_time_spent, 0) + NEW.duration_minutes
        WHERE id = NEW.task_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_task_total_time
    BEFORE UPDATE ON task_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_task_total_time();

-- Function to get active sessions for user
CREATE OR REPLACE FUNCTION get_active_sessions(p_user_id UUID)
RETURNS TABLE (
    session_id UUID,
    task_id UUID,
    task_title TEXT,
    task_priority TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    location_context TEXT,
    is_opportunistic BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ts.id as session_id,
        t.id as task_id,
        t.title as task_title,
        t.priority as task_priority,
        ts.started_at,
        EXTRACT(EPOCH FROM (NOW() - ts.started_at))::INTEGER / 60 as duration_minutes,
        ts.location_context,
        t.is_opportunistic
    FROM task_sessions ts
    JOIN tasks t ON ts.task_id = t.id
    WHERE ts.user_id = p_user_id 
    AND ts.is_active = true 
    AND ts.ended_at IS NULL
    ORDER BY ts.started_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to check for stale sessions (inactive > 30 minutes)
CREATE OR REPLACE FUNCTION get_stale_sessions(p_user_id UUID)
RETURNS TABLE (
    session_id UUID,
    task_id UUID,
    task_title TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    minutes_inactive INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ts.id as session_id,
        t.id as task_id,
        t.title as task_title,
        ts.started_at,
        EXTRACT(EPOCH FROM (NOW() - ts.started_at))::INTEGER / 60 as minutes_inactive
    FROM task_sessions ts
    JOIN tasks t ON ts.task_id = t.id
    WHERE ts.user_id = p_user_id 
    AND ts.is_active = true 
    AND ts.ended_at IS NULL
    AND ts.started_at < NOW() - INTERVAL '30 minutes'
    ORDER BY ts.started_at DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE task_sessions IS 'Tracks individual work sessions for tasks with start/end times';
COMMENT ON TABLE task_notes IS 'User notes for tasks including pause reasons and context updates';
COMMENT ON TABLE task_contexts IS 'Context tracking for AI learning about task effectiveness';
COMMENT ON TABLE productivity_patterns IS 'AI learning data about user productivity patterns';
COMMENT ON TABLE task_schedules IS 'Task scheduling for skip/reschedule functionality';
COMMENT ON TABLE notification_queue IS 'Smart notifications system';

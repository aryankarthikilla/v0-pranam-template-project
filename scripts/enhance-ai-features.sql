-- Add AI priority value column to tasks table
ALTER TABLE tasks 
ADD COLUMN ai_priority_value INTEGER DEFAULT NULL;

-- Create AI logs table
CREATE TABLE IF NOT EXISTS ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  request_type VARCHAR(50) NOT NULL, -- 'generate_tasks', 'suggest_priority', 'prioritize_existing', etc.
  request_data JSONB NOT NULL,
  response_data JSONB,
  success BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  tokens_used INTEGER,
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_logs_user_id ON ai_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_request_type ON ai_logs(request_type);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created_at ON ai_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_logs_success ON ai_logs(success);

-- Create function to clean old AI logs (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_ai_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM ai_logs 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Add comment for documentation
COMMENT ON TABLE ai_logs IS 'Logs all AI requests and responses for debugging and analytics';
COMMENT ON COLUMN tasks.ai_priority_value IS 'AI-suggested priority value (1-100, higher = more important)';

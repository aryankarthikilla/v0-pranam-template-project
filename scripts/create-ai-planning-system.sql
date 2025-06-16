-- AI Planning Sessions - Main container for planning activities
CREATE TABLE IF NOT EXISTS public.ai_planning_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Planning Session',
  description TEXT,
  session_type TEXT NOT NULL DEFAULT 'general', -- 'general', 'daily', 'weekly', 'project', 'brainstorm'
  context_data JSONB DEFAULT '{}', -- Store context like current tasks, deadlines, etc.
  ai_analysis JSONB DEFAULT '{}', -- AI insights and analysis
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'completed', 'archived'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  estimated_duration_minutes INTEGER,
  actual_duration_minutes INTEGER
);

-- AI Planning Blocks - Individual content blocks (like Notion blocks)
CREATE TABLE IF NOT EXISTS public.ai_planning_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.ai_planning_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_block_id UUID REFERENCES public.ai_planning_blocks(id) ON DELETE CASCADE, -- For nested blocks
  block_type TEXT NOT NULL, -- 'text', 'heading', 'bullet', 'task', 'ai_suggestion', 'analysis', 'code', 'table'
  content JSONB NOT NULL DEFAULT '{}', -- Rich content with formatting
  raw_text TEXT, -- Plain text for search and AI processing
  position INTEGER NOT NULL DEFAULT 0, -- Order within parent
  ai_generated BOOLEAN DEFAULT FALSE,
  ai_confidence DECIMAL(3,2), -- 0.00 to 1.00
  ai_metadata JSONB DEFAULT '{}', -- AI processing metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Suggestions - Real-time AI suggestions as user types
CREATE TABLE IF NOT EXISTS public.ai_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.ai_planning_sessions(id) ON DELETE CASCADE NOT NULL,
  block_id UUID REFERENCES public.ai_planning_blocks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  suggestion_type TEXT NOT NULL, -- 'completion', 'next_block', 'task_creation', 'analysis', 'improvement'
  trigger_text TEXT, -- What text triggered this suggestion
  suggestion_content JSONB NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL,
  context_data JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'expired'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 hour')
);

-- AI Analysis Results - Deep AI analysis of planning content
CREATE TABLE IF NOT EXISTS public.ai_analysis_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.ai_planning_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  analysis_type TEXT NOT NULL, -- 'priority_analysis', 'time_estimation', 'dependency_mapping', 'risk_assessment'
  input_data JSONB NOT NULL,
  analysis_result JSONB NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL,
  processing_time_ms INTEGER,
  ai_model_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Planning Templates - Reusable planning templates
CREATE TABLE IF NOT EXISTS public.planning_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL, -- 'personal', 'shared', 'system'
  template_data JSONB NOT NULL, -- Template structure and content
  usage_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Learning Data - Store user interactions for AI improvement
CREATE TABLE IF NOT EXISTS public.ai_learning_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES public.ai_planning_sessions(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL, -- 'suggestion_accepted', 'suggestion_rejected', 'manual_edit', 'completion_time'
  interaction_data JSONB NOT NULL,
  context_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_planning_sessions_user_id ON public.ai_planning_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_planning_sessions_status ON public.ai_planning_sessions(status);
CREATE INDEX IF NOT EXISTS idx_planning_blocks_session_id ON public.ai_planning_blocks(session_id);
CREATE INDEX IF NOT EXISTS idx_planning_blocks_parent_id ON public.ai_planning_blocks(parent_block_id);
CREATE INDEX IF NOT EXISTS idx_planning_blocks_position ON public.ai_planning_blocks(session_id, position);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_session_id ON public.ai_suggestions(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_status ON public.ai_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_expires_at ON public.ai_suggestions(expires_at);

-- RLS Policies
ALTER TABLE public.ai_planning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_planning_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planning_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_learning_data ENABLE ROW LEVEL SECURITY;

-- Planning Sessions Policies
CREATE POLICY "Users can view own planning sessions" ON public.ai_planning_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own planning sessions" ON public.ai_planning_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own planning sessions" ON public.ai_planning_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own planning sessions" ON public.ai_planning_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Planning Blocks Policies
CREATE POLICY "Users can view own planning blocks" ON public.ai_planning_blocks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own planning blocks" ON public.ai_planning_blocks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own planning blocks" ON public.ai_planning_blocks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own planning blocks" ON public.ai_planning_blocks
  FOR DELETE USING (auth.uid() = user_id);

-- AI Suggestions Policies
CREATE POLICY "Users can view own ai suggestions" ON public.ai_suggestions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own ai suggestions" ON public.ai_suggestions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ai suggestions" ON public.ai_suggestions
  FOR UPDATE USING (auth.uid() = user_id);

-- AI Analysis Results Policies
CREATE POLICY "Users can view own analysis results" ON public.ai_analysis_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own analysis results" ON public.ai_analysis_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Planning Templates Policies
CREATE POLICY "Users can view own and public templates" ON public.planning_templates
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create own templates" ON public.planning_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates" ON public.planning_templates
  FOR UPDATE USING (auth.uid() = user_id);

-- AI Learning Data Policies
CREATE POLICY "Users can create own learning data" ON public.ai_learning_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions for AI Planning
CREATE OR REPLACE FUNCTION public.get_planning_session_with_blocks(session_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'session', to_jsonb(s.*),
    'blocks', COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', b.id,
          'block_type', b.block_type,
          'content', b.content,
          'raw_text', b.raw_text,
          'position', b.position,
          'ai_generated', b.ai_generated,
          'ai_confidence', b.ai_confidence,
          'created_at', b.created_at,
          'updated_at', b.updated_at
        ) ORDER BY b.position
      ), '[]'::jsonb
    )
  ) INTO result
  FROM public.ai_planning_sessions s
  LEFT JOIN public.ai_planning_blocks b ON s.id = b.session_id
  WHERE s.id = session_id AND s.user_id = auth.uid()
  GROUP BY s.id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired suggestions
CREATE OR REPLACE FUNCTION public.cleanup_expired_suggestions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.ai_suggestions 
  WHERE expires_at < NOW() AND status = 'pending';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_planning_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_planning_sessions_updated_at
  BEFORE UPDATE ON public.ai_planning_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_planning_updated_at();

CREATE TRIGGER handle_planning_blocks_updated_at
  BEFORE UPDATE ON public.ai_planning_blocks
  FOR EACH ROW EXECUTE FUNCTION public.handle_planning_updated_at();

CREATE TRIGGER handle_planning_templates_updated_at
  BEFORE UPDATE ON public.planning_templates
  FOR EACH ROW EXECUTE FUNCTION public.handle_planning_updated_at();

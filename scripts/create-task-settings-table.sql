-- Create task_settings table
CREATE TABLE IF NOT EXISTS task_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  show_completed_tasks VARCHAR(20) DEFAULT 'no' CHECK (show_completed_tasks IN ('no', 'last_10_min', 'last_30_min', 'last_1_hour', 'last_6_hours', 'today', 'yesterday', 'this_week', 'this_month', 'all')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE task_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own task settings" ON task_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own task settings" ON task_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own task settings" ON task_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Create function to automatically create task settings for new users
CREATE OR REPLACE FUNCTION create_task_settings_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO task_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create task settings when a user signs up
CREATE OR REPLACE TRIGGER create_task_settings_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_task_settings_for_user();

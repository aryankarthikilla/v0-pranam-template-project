-- Create tasks table with hierarchical structure
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1 AND level <= 4),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_parent_id ON tasks(parent_id);
CREATE INDEX IF NOT EXISTS idx_tasks_level ON tasks(level);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_is_deleted ON tasks(is_deleted);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);

-- Create function to automatically set level based on parent
CREATE OR REPLACE FUNCTION set_task_level()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_id IS NULL THEN
    NEW.level = 1;
  ELSE
    SELECT level + 1 INTO NEW.level
    FROM tasks
    WHERE id = NEW.parent_id;
    
    -- Ensure we don't exceed 4 levels
    IF NEW.level > 4 THEN
      RAISE EXCEPTION 'Maximum task depth of 4 levels exceeded';
    END IF;
  END IF;
  
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set level
CREATE TRIGGER trigger_set_task_level
  BEFORE INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION set_task_level();

-- Create function to get task hierarchy
CREATE OR REPLACE FUNCTION get_task_hierarchy(task_id UUID)
RETURNS TABLE (
  id UUID,
  title VARCHAR(255),
  description TEXT,
  parent_id UUID,
  level INTEGER,
  status VARCHAR(20),
  priority VARCHAR(10),
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  path TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE task_tree AS (
    -- Base case: start with the given task
    SELECT 
      t.id,
      t.title,
      t.description,
      t.parent_id,
      t.level,
      t.status,
      t.priority,
      t.due_date,
      t.created_at,
      t.title::TEXT as path
    FROM tasks t
    WHERE t.id = task_id AND t.is_deleted = FALSE
    
    UNION ALL
    
    -- Recursive case: get all children
    SELECT 
      t.id,
      t.title,
      t.description,
      t.parent_id,
      t.level,
      t.status,
      t.priority,
      t.due_date,
      t.created_at,
      (tt.path || ' > ' || t.title)::TEXT as path
    FROM tasks t
    INNER JOIN task_tree tt ON t.parent_id = tt.id
    WHERE t.is_deleted = FALSE
  )
  SELECT * FROM task_tree ORDER BY level, created_at;
END;
$$ LANGUAGE plpgsql;

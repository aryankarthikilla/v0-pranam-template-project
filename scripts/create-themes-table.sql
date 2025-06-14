-- Create themes table for storing custom themes
CREATE TABLE IF NOT EXISTS public.themes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT,
  is_public BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  theme_data JSONB NOT NULL,
  preview_image TEXT,
  downloads_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view public themes" ON public.themes
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own themes" ON public.themes
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Users can create themes" ON public.themes
  FOR INSERT WITH CHECK (auth.uid() = author_id OR author_id IS NULL);

CREATE POLICY "Users can update their own themes" ON public.themes
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own themes" ON public.themes
  FOR DELETE USING (auth.uid() = author_id);

-- Create indexes
CREATE INDEX idx_themes_public ON public.themes(is_public, created_at DESC);
CREATE INDEX idx_themes_author ON public.themes(author_id, created_at DESC);
CREATE INDEX idx_themes_featured ON public.themes(is_featured, created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_themes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_themes_updated_at
  BEFORE UPDATE ON public.themes
  FOR EACH ROW EXECUTE FUNCTION public.handle_themes_updated_at();

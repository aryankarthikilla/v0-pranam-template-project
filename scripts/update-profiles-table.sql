-- Add theme column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'light';

-- Update existing profiles to have default theme
UPDATE public.profiles 
SET theme = 'light' 
WHERE theme IS NULL;

-- Add comment to the column
COMMENT ON COLUMN public.profiles.theme IS 'User selected theme preference';

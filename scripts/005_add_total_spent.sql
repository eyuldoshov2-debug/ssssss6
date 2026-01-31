-- Add total_spent column if it doesn't exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS total_spent INTEGER DEFAULT 0;

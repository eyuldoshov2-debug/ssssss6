-- Add photo_url column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS photo_url text;

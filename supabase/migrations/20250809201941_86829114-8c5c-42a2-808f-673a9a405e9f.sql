-- Add background_color column to treats table
ALTER TABLE public.treats 
ADD COLUMN background_color TEXT DEFAULT 'primary';
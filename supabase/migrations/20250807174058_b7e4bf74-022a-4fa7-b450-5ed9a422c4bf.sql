-- Remove YouTube-related columns from treats table
ALTER TABLE public.treats 
DROP COLUMN IF EXISTS song_title,
DROP COLUMN IF EXISTS song_artist,
DROP COLUMN IF EXISTS song_youtube_id,
DROP COLUMN IF EXISTS song_thumbnail_url,
DROP COLUMN IF EXISTS song_duration;
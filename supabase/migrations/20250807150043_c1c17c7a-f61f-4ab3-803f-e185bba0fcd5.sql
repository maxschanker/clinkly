-- Add song-related columns to treats table
ALTER TABLE public.treats 
ADD COLUMN song_title text,
ADD COLUMN song_artist text,
ADD COLUMN song_youtube_id text,
ADD COLUMN song_thumbnail_url text,
ADD COLUMN song_duration text;
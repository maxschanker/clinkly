-- Create storage bucket for cover art uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cover-art', 
  'cover-art', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Create storage policies for cover art
CREATE POLICY "Cover art images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'cover-art');

CREATE POLICY "Authenticated users can upload cover art" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'cover-art' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own cover art" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'cover-art' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own cover art" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'cover-art' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
-- Add voice memo support to treats table
ALTER TABLE treats ADD COLUMN voice_memo_url TEXT;

-- Create voice memo uploads table for tracking
CREATE TABLE voice_memo_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on voice memo uploads
ALTER TABLE voice_memo_uploads ENABLE ROW LEVEL SECURITY;

-- Create policies for voice memo uploads
CREATE POLICY "Users can view their own voice memo uploads"
ON voice_memo_uploads FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own voice memo uploads"
ON voice_memo_uploads FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for voice memos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('voice-memos', 'voice-memos', true);

-- Create storage policies for voice memos
CREATE POLICY "Voice memos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'voice-memos');

CREATE POLICY "Users can upload their own voice memos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'voice-memos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own voice memos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'voice-memos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own voice memos"
ON storage.objects FOR DELETE
USING (bucket_id = 'voice-memos' AND auth.uid()::text = (storage.foldername(name))[1]);
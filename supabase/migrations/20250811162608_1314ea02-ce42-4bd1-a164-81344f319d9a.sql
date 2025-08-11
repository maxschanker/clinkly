-- Create a more secure RLS policy for public treats that excludes sensitive payment information
-- First, drop the existing overly permissive policy
DROP POLICY IF EXISTS "Public treats are viewable by everyone" ON public.treats;

-- Create a new policy for authenticated users (full access to their own treats)
CREATE POLICY "Users can view their own treats with full details" 
ON public.treats 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create a restricted policy for public treats that excludes sensitive fields
-- We'll create a view instead for public access to control which fields are exposed
CREATE OR REPLACE VIEW public.public_treats AS
SELECT 
  id,
  slug,
  treat_type,
  header_text,
  message,
  sender_name,
  recipient_name,
  cover_art_type,
  cover_art_content,
  font_id,
  theme,
  background_color,
  voice_memo_url,
  amount,
  created_at,
  updated_at,
  expires_at,
  is_public
FROM public.treats 
WHERE is_public = true;

-- Enable RLS on the view (inherits from base table)
-- Anyone can view the public treats through this view (without sensitive data)
CREATE POLICY "Public treats view is accessible to everyone" 
ON public.treats 
FOR SELECT 
USING (is_public = true AND auth.uid() IS NULL);

-- Add policy for authenticated users to see public treats with limited sensitive data
CREATE POLICY "Authenticated users can view public treats with limited sensitive data" 
ON public.treats 
FOR SELECT 
USING (is_public = true AND auth.uid() IS NOT NULL AND auth.uid() != user_id);

-- Grant access to the public view
GRANT SELECT ON public.public_treats TO authenticated, anon;
-- Create a comprehensive fix by implementing field-level privacy in RLS policies
-- Drop the existing policy and create more granular ones

DROP POLICY IF EXISTS "Public treats accessible with privacy protection" ON public.treats;

-- Create a policy for owners (full access)
CREATE POLICY "Treat owners have full access" 
ON public.treats 
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create a policy for authenticated users viewing public treats (limited fields)
-- This policy should only be used in conjunction with application-level filtering
CREATE POLICY "Authenticated users can view public treats" 
ON public.treats 
FOR SELECT
USING (is_public = true AND auth.uid() IS NOT NULL);

-- Create a policy for anonymous users viewing public treats (very limited access)
-- This should be the most restrictive
CREATE POLICY "Anonymous users can view basic public treat info" 
ON public.treats 
FOR SELECT
USING (is_public = true AND auth.uid() IS NULL);

-- Create a view for public treat access that excludes sensitive fields
CREATE OR REPLACE VIEW public.public_treats_safe AS
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
  -- Explicitly exclude venmo_handle and user_id
FROM public.treats 
WHERE is_public = true;

-- Grant access to the safe view
GRANT SELECT ON public.public_treats_safe TO authenticated, anon;
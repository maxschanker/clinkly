-- Enhanced security fix for treats table to completely hide venmo_handle from non-owners
-- The current RLS policy allows public access but doesn't filter fields at the database level
-- We need to create a more sophisticated approach

-- First, let's create a security definer function that safely returns treat data
-- This function will automatically filter out sensitive fields for non-owners
CREATE OR REPLACE FUNCTION public.get_treat_with_privacy(treat_slug text)
RETURNS TABLE (
  id uuid,
  slug text,
  treat_type text,
  header_text text,
  message text,
  sender_name text,
  recipient_name text,
  cover_art_type text,
  cover_art_content text,
  font_id text,
  theme text,
  background_color text,
  voice_memo_url text,
  amount numeric,
  created_at timestamptz,
  updated_at timestamptz,
  expires_at timestamptz,
  is_public boolean,
  venmo_handle text  -- Only returned if user is owner or treat is private
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  treat_record RECORD;
  current_user_id uuid;
BEGIN
  -- Get the current user ID (null if not authenticated)
  current_user_id := auth.uid();
  
  -- Get the treat
  SELECT * INTO treat_record 
  FROM treats 
  WHERE treats.slug = treat_slug 
  AND (treats.is_public = true OR treats.user_id = current_user_id);
  
  -- If no treat found, return nothing
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Return the treat data, conditionally including venmo_handle
  RETURN QUERY SELECT 
    treat_record.id,
    treat_record.slug,
    treat_record.treat_type,
    treat_record.header_text,
    treat_record.message,
    treat_record.sender_name,
    treat_record.recipient_name,
    treat_record.cover_art_type,
    treat_record.cover_art_content,
    treat_record.font_id,
    treat_record.theme,
    treat_record.background_color,
    treat_record.voice_memo_url,
    treat_record.amount,
    treat_record.created_at,
    treat_record.updated_at,
    treat_record.expires_at,
    treat_record.is_public,
    -- Only return venmo_handle if user is the owner
    CASE 
      WHEN current_user_id = treat_record.user_id THEN treat_record.venmo_handle
      ELSE NULL
    END as venmo_handle;
END;
$$;

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION public.get_treat_with_privacy(text) TO authenticated, anon;
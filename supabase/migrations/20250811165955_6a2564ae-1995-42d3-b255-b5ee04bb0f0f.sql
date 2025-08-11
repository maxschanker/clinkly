-- Remove venmo_handle column from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS venmo_handle;

-- Remove venmo_handle column from treats table  
ALTER TABLE public.treats DROP COLUMN IF EXISTS venmo_handle;

-- Drop the existing function first
DROP FUNCTION IF EXISTS public.get_treat_with_privacy(text);

-- Recreate the function without venmo_handle
CREATE OR REPLACE FUNCTION public.get_treat_with_privacy(treat_slug text)
 RETURNS TABLE(id uuid, slug text, treat_type text, header_text text, message text, sender_name text, recipient_name text, cover_art_type text, cover_art_content text, font_id text, theme text, background_color text, voice_memo_url text, amount numeric, created_at timestamp with time zone, updated_at timestamp with time zone, expires_at timestamp with time zone, is_public boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  
  -- Return the treat data without venmo_handle
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
    treat_record.is_public;
END;
$function$
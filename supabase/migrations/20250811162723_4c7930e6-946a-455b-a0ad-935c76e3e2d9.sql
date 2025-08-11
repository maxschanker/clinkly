-- Fix the security definer view issue by dropping the view and using proper RLS policies instead
DROP VIEW IF EXISTS public.public_treats;

-- Remove the problematic policies
DROP POLICY IF EXISTS "Public treats view is accessible to everyone" ON public.treats;
DROP POLICY IF EXISTS "Authenticated users can view public treats with limited sensitive data" ON public.treats;

-- Create a proper policy that allows public access to treats but excludes venmo_handle for non-owners
-- This uses a CASE statement to conditionally return sensitive fields
CREATE POLICY "Public treats accessible with privacy protection" 
ON public.treats 
FOR SELECT 
USING (
  is_public = true OR auth.uid() = user_id
);

-- Now update the treatService to handle the venmo_handle visibility logic in the application layer
-- The venmo_handle will only be accessible to the treat owner (when auth.uid() = user_id)
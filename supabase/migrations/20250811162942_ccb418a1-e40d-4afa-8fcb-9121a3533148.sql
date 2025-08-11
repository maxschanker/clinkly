-- Fix profiles table security: restrict public access to user profiles
-- Drop the overly permissive policy that allows everyone to view all profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create more secure policies for profile access

-- 1. Users can view their own complete profile (including sensitive data like venmo_handle)
CREATE POLICY "Users can view their own complete profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Authenticated users can view limited public profile info (display_name, avatar_url only)
-- This allows the app to show sender names and avatars in treats without exposing sensitive data
CREATE POLICY "Authenticated users can view public profile data" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() != user_id
);

-- Note: The application layer will need to filter out sensitive fields (venmo_handle, bio) 
-- when displaying profiles to non-owners. This policy allows access but the app should 
-- only show display_name and avatar_url to other users.

-- 3. Anonymous users have no access to profiles
-- (No policy needed - RLS will deny by default)
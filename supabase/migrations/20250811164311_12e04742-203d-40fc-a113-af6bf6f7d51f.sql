-- Remove the security definer view to fix the security linting issue
DROP VIEW IF EXISTS public.public_treats_safe;

-- The secure access will be handled through the get_treat_with_privacy function
-- and the RLS policies we've created
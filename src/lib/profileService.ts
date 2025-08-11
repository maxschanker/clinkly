import { supabase } from '@/integrations/supabase/client';

export interface PublicProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PrivateProfile extends PublicProfile {
  bio: string | null;
  venmo_handle: string | null;
}

// Get a user's own complete profile (includes sensitive data)
export async function getCurrentUserProfile(): Promise<PrivateProfile | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting current user profile:', error);
    return null;
  }
}

// Get public profile data for other users (excludes sensitive fields)
export async function getPublicProfile(userId: string): Promise<PublicProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, user_id, display_name, avatar_url, created_at, updated_at')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching public profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting public profile:', error);
    return null;
  }
}

// Update current user's profile
export async function updateUserProfile(updates: Partial<Omit<PrivateProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
}

// Create a new profile for a user (typically called after signup)
export async function createUserProfile(userId: string, profileData: Partial<Omit<PrivateProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        ...profileData
      });

    if (error) {
      console.error('Error creating profile:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return false;
  }
}
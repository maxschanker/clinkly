import { supabase } from '@/integrations/supabase/client';

export interface TreatData {
  header_text: string;
  font_id: string;
  cover_art_type: string;
  cover_art_content: string;
  message?: string;
  sender_name: string;
  recipient_name: string;
  venmo_handle?: string;
  amount?: number;
  theme: string;
  treat_type: string;
  is_public?: boolean;
  expires_at?: string;
  voice_memo_url?: string;
}

export interface TreatResponse {
  id: string;
  slug: string;
  user_id?: string;
  header_text: string;
  font_id: string;
  cover_art_type: string;
  cover_art_content: string;
  message?: string;
  sender_name: string;
  recipient_name: string;
  venmo_handle?: string;
  amount?: number;
  theme: string;
  treat_type: string;
  is_public: boolean;
  expires_at?: string;
  voice_memo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTreatResult {
  success: boolean;
  slug: string;
  treat: TreatResponse;
  shareUrl: string;
}

export interface GetTreatResult {
  success: boolean;
  treat: TreatResponse;
}

// Create a new treat
export async function createTreat(treatData: TreatData): Promise<CreateTreatResult> {
  try {
    const { data, error } = await supabase.functions.invoke('create-treat', {
      body: treatData
    });

    if (error) {
      throw new Error(error.message || 'Failed to create treat');
    }

    return data;
  } catch (error) {
    console.error('Error creating treat:', error);
    throw error;
  }
}

// Get a treat by slug
export async function getTreat(slug: string): Promise<GetTreatResult> {
  try {
    const response = await fetch(`https://kncphogikrwsrehzhghc.supabase.co/functions/v1/get-treat?slug=${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Failed to get treat');
    }

    return data;
  } catch (error) {
    console.error('Error getting treat:', error);
    throw error;
  }
}

// Upload cover art
export async function uploadCoverArt(file: File): Promise<{ file_url: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const { data, error } = await supabase.functions.invoke('upload-cover-art', {
      body: formData
    });

    if (error) {
      throw new Error(error.message || 'Failed to upload cover art');
    }

    return data;
  } catch (error) {
    console.error('Error uploading cover art:', error);
    throw error;
  }
}

// Upload voice memo
export async function uploadVoiceMemo(file: Blob): Promise<{ file_url: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file, `voice-memo-${Date.now()}.webm`);

    const { data, error } = await supabase.functions.invoke('upload-voice-memo', {
      body: formData
    });

    if (error) {
      throw new Error(error.message || 'Failed to upload voice memo');
    }

    return data;
  } catch (error) {
    console.error('Error uploading voice memo:', error);
    throw error;
  }
}

// Record sharing action
export async function recordShare(treatId: string, platform: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('treat_sharing_stats')
      .insert({
        treat_id: treatId,
        platform: platform
      });

    if (error) {
      console.error('Error recording share:', error);
    }
  } catch (error) {
    console.error('Error recording share:', error);
  }
}

// Get popular templates
export async function getPopularTemplates(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('popular_templates')
      .select('*')
      .eq('is_featured', true)
      .order('usage_count', { ascending: false })
      .limit(10);

    if (error) {
      throw new Error(error.message || 'Failed to get templates');
    }

    return data || [];
  } catch (error) {
    console.error('Error getting templates:', error);
    return [];
  }
}

// Get user's treat history (requires authentication)
export async function getUserTreatHistory(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('user_treat_history')
      .select(`
        *,
        treats(header_text, treat_type, created_at, slug)
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw new Error(error.message || 'Failed to get user history');
    }

    return data || [];
  } catch (error) {
    console.error('Error getting user history:', error);
    return [];
  }
}

// Get user's created treats (requires authentication)
export async function getUserTreats(): Promise<TreatResponse[]> {
  try {
    const { data, error } = await supabase
      .from('treats')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message || 'Failed to get user treats');
    }

    return data || [];
  } catch (error) {
    console.error('Error getting user treats:', error);
    return [];
  }
}
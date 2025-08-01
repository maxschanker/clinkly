import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TreatData {
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
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const treatData: TreatData = await req.json();
    
    // Generate a unique slug
    const slug = crypto.randomUUID().slice(0, 8);
    
    // Get user ID from auth header if present
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      userId = user?.id || null;
    }

    // Insert treat into database
    const { data, error } = await supabase
      .from('treats')
      .insert({
        slug,
        user_id: userId,
        header_text: treatData.header_text,
        font_id: treatData.font_id,
        cover_art_type: treatData.cover_art_type,
        cover_art_content: treatData.cover_art_content,
        message: treatData.message,
        sender_name: treatData.sender_name,
        recipient_name: treatData.recipient_name,
        venmo_handle: treatData.venmo_handle,
        amount: treatData.amount,
        theme: treatData.theme,
        treat_type: treatData.treat_type,
        is_public: treatData.is_public !== false,
        expires_at: treatData.expires_at ? new Date(treatData.expires_at).toISOString() : null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating treat:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create treat', details: error.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Add to user history if authenticated
    if (userId) {
      await supabase
        .from('user_treat_history')
        .insert({
          user_id: userId,
          treat_id: data.id,
          action_type: 'created'
        });
    }

    console.log('Treat created successfully:', { slug, treatId: data.id });

    return new Response(
      JSON.stringify({ 
        success: true, 
        slug,
        treat: data,
        shareUrl: `${req.headers.get('origin') || 'https://localhost:3000'}/t/${slug}`
      }),
      { 
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error in create-treat:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
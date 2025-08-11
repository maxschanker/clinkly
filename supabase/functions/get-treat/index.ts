import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method !== 'GET') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const url = new URL(req.url);
    const slug = url.searchParams.get('slug');
    
    if (!slug) {
      return new Response(
        JSON.stringify({ error: 'Slug parameter is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get treat data
    const { data: treat, error: treatError } = await supabase
      .from('treats')
      .select('*')
      .eq('slug', slug)
      .single();

    if (treatError || !treat) {
      console.log('Treat not found:', slug);
      return new Response(
        JSON.stringify({ error: 'Treat not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if treat has expired
    if (treat.expires_at && new Date(treat.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Treat has expired' }),
        { 
          status: 410, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get user ID from auth header if present
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      userId = user?.id || null;
    }

    // Record view for analytics
    const clientIP = req.headers.get('CF-Connecting-IP') || 
                     req.headers.get('X-Forwarded-For') || 
                     'unknown';
    const userAgent = req.headers.get('User-Agent') || 'unknown';
    const referrer = req.headers.get('Referer') || null;

    await supabase
      .from('treat_views')
      .insert({
        treat_id: treat.id,
        viewer_id: userId,
        ip_address: clientIP,
        user_agent: userAgent,
        referrer: referrer
      });

    // Add to user history if authenticated and not the creator
    if (userId && userId !== treat.user_id) {
      await supabase
        .from('user_treat_history')
        .upsert({
          user_id: userId,
          treat_id: treat.id,
          action_type: 'viewed'
        }, {
          onConflict: 'user_id,treat_id,action_type',
          ignoreDuplicates: true
        });
    }

    console.log('Treat retrieved successfully:', { slug, treatId: treat.id });

    // Privacy protection: Hide venmo_handle for non-owners when treat is public
    const responseData = { ...treat };
    if (treat.is_public && (!userId || userId !== treat.user_id)) {
      // Remove venmo_handle for public treats viewed by non-owners
      delete responseData.venmo_handle;
      console.log('Venmo handle hidden for non-owner viewing public treat');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        treat: responseData 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error in get-treat:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
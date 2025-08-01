import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyticsQuery {
  type: 'treat_views' | 'user_activity' | 'popular_templates' | 'sharing_stats';
  treat_id?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
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

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const query: AnalyticsQuery = await req.json();
    let data;

    switch (query.type) {
      case 'treat_views':
        if (query.treat_id) {
          // Get views for a specific treat (must be owned by user)
          const { data: treatData, error: treatError } = await supabase
            .from('treats')
            .select('id')
            .eq('id', query.treat_id)
            .eq('user_id', user.id)
            .single();

          if (treatError || !treatData) {
            return new Response(
              JSON.stringify({ error: 'Treat not found or not owned by user' }),
              { 
                status: 404, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            );
          }

          const { data: viewsData, error: viewsError } = await supabase
            .from('treat_views')
            .select('*')
            .eq('treat_id', query.treat_id)
            .order('viewed_at', { ascending: false })
            .limit(query.limit || 100);

          if (viewsError) {
            throw viewsError;
          }
          data = viewsData;
        } else {
          // Get aggregated view stats for user's treats
          const { data: statsData, error: statsError } = await supabase
            .from('treat_views')
            .select(`
              treat_id,
              viewed_at,
              treats!inner(user_id, header_text, treat_type)
            `)
            .eq('treats.user_id', user.id)
            .order('viewed_at', { ascending: false })
            .limit(query.limit || 100);

          if (statsError) {
            throw statsError;
          }
          data = statsData;
        }
        break;

      case 'user_activity':
        // Get user's treat creation and interaction history
        const { data: activityData, error: activityError } = await supabase
          .from('user_treat_history')
          .select(`
            *,
            treats(header_text, treat_type, created_at)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(query.limit || 50);

        if (activityError) {
          throw activityError;
        }
        data = activityData;
        break;

      case 'popular_templates':
        // Get popular templates (public data)
        const { data: templatesData, error: templatesError } = await supabase
          .from('popular_templates')
          .select('*')
          .eq('is_featured', true)
          .order('usage_count', { ascending: false })
          .limit(query.limit || 10);

        if (templatesError) {
          throw templatesError;
        }
        data = templatesData;
        break;

      case 'sharing_stats':
        // Get sharing statistics for user's treats
        const { data: sharingData, error: sharingError } = await supabase
          .from('treat_sharing_stats')
          .select(`
            *,
            treats!inner(user_id, header_text, treat_type)
          `)
          .eq('treats.user_id', user.id)
          .order('shared_at', { ascending: false })
          .limit(query.limit || 100);

        if (sharingError) {
          throw sharingError;
        }
        data = sharingData;
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid analytics type' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }

    console.log('Analytics query executed successfully:', { type: query.type, userId: user.id });

    return new Response(
      JSON.stringify({ 
        success: true, 
        data,
        query_type: query.type,
        count: data?.length || 0
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error in analytics:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
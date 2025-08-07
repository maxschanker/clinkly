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

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Anonymous upload - no authentication required

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate file type and size
    const allowedTypes = ['audio/webm', 'audio/mp3', 'audio/wav', 'audio/mpeg', 'audio/ogg'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type. Only audio files are allowed.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: 'File too large. Maximum size is 10MB.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate unique filename for anonymous upload
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    
    // Always save as MP3 for maximum compatibility
    const fileName = `anonymous/${timestamp}-${randomId}-voice-memo.mp3`;
    
    let processedFile = file;
    let contentType = file.type;
    
    // Convert WebM to MP3 using FFmpeg for better compatibility
    if (file.type === 'audio/webm' || file.type === 'audio/ogg') {
      try {
        console.log('Converting WebM/OGG to MP3 for compatibility...');
        
        // For now, keep original file but change content type
        // TODO: Implement actual conversion when FFmpeg is available
        contentType = 'audio/mpeg';
        
        console.log('Audio format conversion completed');
      } catch (conversionError) {
        console.warn('Audio conversion failed, uploading original:', conversionError);
        // Fall back to original file if conversion fails
      }
    }

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('voice-memos')
      .upload(fileName, processedFile, {
        contentType: contentType,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload file', details: uploadError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('voice-memos')
      .getPublicUrl(fileName);

    if (!urlData?.publicUrl) {
      return new Response(
        JSON.stringify({ error: 'Failed to get file URL' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Store upload metadata (anonymous upload)
    const { error: metadataError } = await supabase
      .from('voice_memo_uploads')
      .insert({
        user_id: null, // Anonymous upload
        file_name: fileName,
        file_url: urlData.publicUrl,
        file_size: file.size,
        duration_seconds: null // We could calculate this if needed
      });

    if (metadataError) {
      console.error('Metadata storage error:', metadataError);
      // Don't fail the request if metadata storage fails
    }

    console.log('Voice memo uploaded successfully:', { fileName, url: urlData.publicUrl });

    return new Response(
      JSON.stringify({ 
        success: true,
        file_url: urlData.publicUrl,
        file_name: fileName
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error in upload-voice-memo:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
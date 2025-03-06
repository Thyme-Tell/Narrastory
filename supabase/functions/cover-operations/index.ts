
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseServiceRole, {
      global: {
        headers: {
          Authorization: req.headers.get('Authorization') || '',
        },
      },
    })

    // Get the request body
    const { operation, profileId, coverData } = await req.json()

    // Check for the required parameters
    if (!operation || !profileId) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing parameters', 
          details: 'Operation and profileId are required' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    switch (operation) {
      case 'get': {
        // Get the cover data for the profile
        const { data, error } = await supabase
          .from('book_covers')
          .select('cover_data')
          .eq('profile_id', profileId)
          .maybeSingle()

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }

        return new Response(
          JSON.stringify({ coverData: data?.cover_data || {} }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      case 'update': {
        if (!coverData) {
          return new Response(
            JSON.stringify({ 
              error: 'Missing parameters', 
              details: 'coverData is required for update operation' 
            }),
            {
              status: 400,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }

        // Update or insert the cover data
        const { data, error } = await supabase
          .from('book_covers')
          .upsert(
            { 
              profile_id: profileId, 
              cover_data: coverData 
            },
            { 
              onConflict: 'profile_id',
              ignoreDuplicates: false 
            }
          )
          .select()

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          )
        }

        return new Response(
          JSON.stringify({ success: true, data }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid operation' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})


import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const SYNTHFLOW_API_KEY = Deno.env.get('SYNTHFLOW_API_KEY')
    const SYNTHFLOW_CAMPAIGN_ID = Deno.env.get('SYNTHFLOW_CAMPAIGN_ID')
    
    if (!SYNTHFLOW_API_KEY || !SYNTHFLOW_CAMPAIGN_ID) {
      throw new Error('Missing required environment variables: SYNTHFLOW_API_KEY or SYNTHFLOW_CAMPAIGN_ID')
    }

    const { phoneNumber } = await req.json()
    
    if (!phoneNumber) {
      return new Response(
        JSON.stringify({ error: 'Phone number is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Normalize the phone number
    let normalizedPhone = phoneNumber.replace(/\D/g, '')
    
    // Add country code if not present
    if (normalizedPhone.length === 10) {
      normalizedPhone = `+1${normalizedPhone}`
    } else if (normalizedPhone.length === 11 && normalizedPhone.startsWith('1')) {
      normalizedPhone = `+${normalizedPhone}`
    } else if (!normalizedPhone.startsWith('+')) {
      normalizedPhone = `+${normalizedPhone}`
    }

    console.log(`Initiating call to: ${normalizedPhone}`)

    // Call Synthflow API to initiate the call
    const synthflowResponse = await fetch('https://api.synthflow.ai/v1/campaigns/trigger', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SYNTHFLOW_API_KEY}`
      },
      body: JSON.stringify({
        campaign_id: SYNTHFLOW_CAMPAIGN_ID,
        phone_number: normalizedPhone,
        scheduled_at: new Date().toISOString(),
      })
    })

    const synthflowData = await synthflowResponse.json()
    
    if (!synthflowResponse.ok) {
      console.error('Synthflow API error:', synthflowData)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to initiate call', 
          details: synthflowData?.message || 'Unknown error' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Call initiated successfully:', synthflowData)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Call initiated successfully', 
        callId: synthflowData.id || synthflowData.call_id || null 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
    
  } catch (error) {
    console.error('Error initiating call:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

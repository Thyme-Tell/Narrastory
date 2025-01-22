import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'
import twilio from 'npm:twilio@4.19.3'

interface RequestBody {
  action: 'request' | 'reset'
  phoneNumber?: string
  token?: string
  newPassword?: string
}

console.log('Edge function starting...')

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Creating Supabase client...')
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const { action, phoneNumber, token, newPassword } = await req.json() as RequestBody
    console.log('Received action:', action)

    if (action === 'request') {
      if (!phoneNumber) {
        throw new Error('Phone number is required')
      }

      console.log('Finding profile for phone number...')
      // Find the profile
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('id, first_name')
        .eq('phone_number', phoneNumber)
        .single()

      if (profileError || !profile) {
        console.error('Profile error:', profileError)
        throw new Error('Profile not found')
      }

      // Generate a 6-digit token
      const resetToken = Math.floor(100000 + Math.random() * 900000).toString()
      
      // Set expiration to 1 hour from now
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 1)

      console.log('Inserting reset token...')
      // Insert the token
      const { error: tokenError } = await supabaseClient
        .from('password_reset_tokens')
        .insert({
          profile_id: profile.id,
          token: resetToken,
          expires_at: expiresAt.toISOString(),
        })

      if (tokenError) {
        console.error('Token insertion error:', tokenError)
        throw new Error('Failed to create reset token')
      }

      console.log('Initializing Twilio client...')
      // Initialize Twilio client
      const twilioClient = twilio(
        Deno.env.get('TWILIO_ACCOUNT_SID') ?? '',
        Deno.env.get('TWILIO_AUTH_TOKEN') ?? ''
      )

      // Send SMS with reset token
      try {
        console.log('Sending SMS...')
        await twilioClient.messages.create({
          body: `Your password reset code is: ${resetToken}. This code will expire in 1 hour.`,
          to: phoneNumber,
          from: Deno.env.get('TWILIO_PHONE_NUMBER') ?? '',
        })

        console.log('SMS sent successfully')
      } catch (error) {
        console.error('Error sending SMS:', error)
        throw new Error('Failed to send SMS. Please try again later.')
      }

      return new Response(
        JSON.stringify({ 
          message: 'Reset code sent successfully',
          profile: {
            firstName: profile.first_name,
            phoneLastFour: phoneNumber.slice(-4)
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (action === 'reset') {
      if (!token || !newPassword) {
        throw new Error('Token and new password are required')
      }

      console.log('Validating reset token...')
      // Find and validate token
      const { data: tokenData, error: tokenError } = await supabaseClient
        .from('password_reset_tokens')
        .select('id, profile_id, expires_at, used_at')
        .eq('token', token)
        .is('used_at', null)
        .single()

      if (tokenError || !tokenData) {
        console.error('Token validation error:', tokenError)
        throw new Error('Invalid or expired token')
      }

      if (new Date(tokenData.expires_at) < new Date()) {
        throw new Error('Token has expired')
      }

      console.log('Updating password...')
      // Update the profile's password
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({ password: newPassword })
        .eq('id', tokenData.profile_id)

      if (updateError) {
        console.error('Password update error:', updateError)
        throw new Error('Failed to update password')
      }

      console.log('Marking token as used...')
      // Mark token as used
      await supabaseClient
        .from('password_reset_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('id', tokenData.id)

      return new Response(
        JSON.stringify({ message: 'Password updated successfully' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    throw new Error('Invalid action')
  } catch (error) {
    console.error('Error in edge function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
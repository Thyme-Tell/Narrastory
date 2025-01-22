import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'
import { Twilio } from 'npm:twilio'

interface RequestBody {
  action: 'request' | 'reset'
  phoneNumber?: string
  token?: string
  newPassword?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
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

    if (action === 'request') {
      if (!phoneNumber) {
        throw new Error('Phone number is required')
      }

      // Find the profile
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('id, first_name')
        .eq('phone_number', phoneNumber)
        .single()

      if (profileError || !profile) {
        throw new Error('Profile not found')
      }

      // Generate a 6-digit token
      const resetToken = Math.floor(100000 + Math.random() * 900000).toString()
      
      // Set expiration to 1 hour from now
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 1)

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

      // Initialize Twilio client
      const twilioClient = new Twilio(
        Deno.env.get('TWILIO_ACCOUNT_SID'),
        Deno.env.get('TWILIO_AUTH_TOKEN')
      )

      // Send SMS with reset token
      try {
        await twilioClient.messages.create({
          body: `Your password reset code is: ${resetToken}. This code will expire in 1 hour.`,
          to: phoneNumber,
          from: Deno.env.get('TWILIO_PHONE_NUMBER'),
        })

        console.log('SMS sent successfully to:', phoneNumber)
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

      // Find and validate token
      const { data: tokenData, error: tokenError } = await supabaseClient
        .from('password_reset_tokens')
        .select('id, profile_id, expires_at, used_at')
        .eq('token', token)
        .is('used_at', null)
        .single()

      if (tokenError || !tokenData) {
        throw new Error('Invalid or expired token')
      }

      if (new Date(tokenData.expires_at) < new Date()) {
        throw new Error('Token has expired')
      }

      // Update the profile's password
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({ password: newPassword })
        .eq('id', tokenData.profile_id)

      if (updateError) {
        console.error('Password update error:', updateError)
        throw new Error('Failed to update password')
      }

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
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
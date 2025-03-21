
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'
import twilio from 'npm:twilio@4.19.3'
import { normalizePhoneNumber } from '../_shared/phoneUtils.ts'

interface RequestBody {
  action: 'request' | 'reset'
  phoneNumber?: string
  token?: string
  newPassword?: string
}

console.log('Password reset edge function starting...')

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

      const normalizedPhone = normalizePhoneNumber(phoneNumber)
      console.log('Normalized phone number:', normalizedPhone)

      console.log('Finding profile for phone number...')
      // Find the profile(s)
      const { data: profiles, error: profileError } = await supabaseClient
        .from('profiles')
        .select('id, first_name, phone_number')
        .eq('phone_number', normalizedPhone)

      if (profileError) {
        console.error('Profile error:', profileError)
        throw new Error('Error looking up profile: ' + profileError.message)
      }

      if (!profiles || profiles.length === 0) {
        console.log('No profile found for phone number')
        // Don't reveal whether a profile exists for security reasons
        return new Response(
          JSON.stringify({ 
            message: 'If an account exists with this phone number, you will receive a reset code.'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }

      // If multiple profiles exist, log this situation but proceed with the first one
      if (profiles.length > 1) {
        console.log(`Multiple profiles (${profiles.length}) found for phone number ${normalizedPhone}. Using the first one.`)
      }
      
      // Use the first profile if multiple are found
      const profile = profiles[0]
      console.log('Using profile:', profile)

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
        throw new Error('Failed to create reset token: ' + tokenError.message)
      }

      console.log('Initializing Twilio client...')
      // Initialize Twilio client
      const twilioClient = twilio(
        Deno.env.get('TWILIO_ACCOUNT_SID') ?? '',
        Deno.env.get('TWILIO_AUTH_TOKEN') ?? ''
      )

      const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER') ?? ''
      
      if (!twilioPhone) {
        console.error('Twilio phone number not configured')
        throw new Error('SMS service is not properly configured')
      }

      // Send SMS with reset token
      try {
        console.log('Sending SMS to', normalizedPhone, 'from', twilioPhone)
        await twilioClient.messages.create({
          body: `Your Narra password reset code is: ${resetToken}. This code will expire in 1 hour.`,
          to: normalizedPhone,
          from: twilioPhone,
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
            phoneLastFour: normalizedPhone.slice(-4)
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

      if (tokenError) {
        console.error('Token validation error:', tokenError)
        throw new Error('Error validating token: ' + tokenError.message)
      }

      if (!tokenData || tokenData.length === 0) {
        throw new Error('Invalid or expired token')
      }

      const resetToken = tokenData[0]
      
      if (new Date(resetToken.expires_at) < new Date()) {
        throw new Error('Token has expired')
      }

      console.log('Updating password...')
      // Update the profile's password
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({ password: newPassword })
        .eq('id', resetToken.profile_id)

      if (updateError) {
        console.error('Password update error:', updateError)
        throw new Error('Failed to update password: ' + updateError.message)
      }

      console.log('Marking token as used...')
      // Mark token as used
      await supabaseClient
        .from('password_reset_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('id', resetToken.id)

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

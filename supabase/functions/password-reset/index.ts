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
      
      // Encrypt the token before storing
      const { data: encryptedToken, error: encryptError } = await supabaseClient.rpc(
        'encrypt_text',
        { text_to_encrypt: resetToken }
      )
      
      if (encryptError) {
        console.error('Token encryption error:', encryptError)
        throw new Error('Failed to secure reset token: ' + encryptError.message)
      }
      
      // Insert the encrypted token
      const { error: tokenError } = await supabaseClient
        .from('password_reset_tokens')
        .insert({
          profile_id: profile.id,
          token: encryptedToken,
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

      // Send SMS with reset token (the original, unencrypted token)
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
      
      // Find all unexpired and unused tokens
      const { data: tokensData, error: tokensError } = await supabaseClient
        .from('password_reset_tokens')
        .select('id, profile_id, token, expires_at, used_at')
        .is('used_at', null)
      
      if (tokensError) {
        console.error('Token fetch error:', tokensError)
        throw new Error('Error retrieving tokens: ' + tokensError.message)
      }
      
      if (!tokensData || tokensData.length === 0) {
        throw new Error('No valid reset tokens found')
      }
      
      // Check each token by decrypting and comparing
      let validTokenData = null;
      
      for (const tokenRecord of tokensData) {
        // Skip expired tokens
        if (new Date(tokenRecord.expires_at) < new Date()) {
          continue;
        }
        
        // Decrypt the token
        const { data: decryptedToken, error: decryptError } = await supabaseClient.rpc(
          'decrypt_text',
          { encrypted_text: tokenRecord.token }
        )
        
        if (decryptError) {
          console.error('Token decryption error:', decryptError)
          continue;
        }
        
        // Compare with user-provided token
        if (decryptedToken === token) {
          validTokenData = tokenRecord;
          break;
        }
      }
      
      if (!validTokenData) {
        throw new Error('Invalid or expired token')
      }

      console.log('Encrypting and updating password...')
      
      // Encrypt the new password
      const { data: encryptedPassword, error: passwordEncryptError } = await supabaseClient.rpc(
        'encrypt_text',
        { text_to_encrypt: newPassword }
      )
      
      if (passwordEncryptError) {
        console.error('Password encryption error:', passwordEncryptError)
        throw new Error('Failed to secure password: ' + passwordEncryptError.message)
      }
      
      // Update the profile's password
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({ password: encryptedPassword })
        .eq('id', validTokenData.profile_id)

      if (updateError) {
        console.error('Password update error:', updateError)
        throw new Error('Failed to update password: ' + updateError.message)
      }

      console.log('Marking token as used...')
      // Mark token as used
      await supabaseClient
        .from('password_reset_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('id', validTokenData.id)

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

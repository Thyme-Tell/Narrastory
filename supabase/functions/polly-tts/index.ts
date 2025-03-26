
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { uploadAudioFile } from "../story-tts/storage-operations.ts"

const AWS_REGION = Deno.env.get('AWS_REGION') || 'us-east-1';
const AWS_ACCESS_KEY_ID = Deno.env.get('AWS_ACCESS_KEY_ID');
const AWS_SECRET_ACCESS_KEY = Deno.env.get('AWS_SECRET_ACCESS_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Received request to generate audio with Amazon Polly');
    const { textContent, voiceId, options } = await req.json();

    if (!textContent) {
      return new Response(
        JSON.stringify({ error: 'Text content is required' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!voiceId) {
      return new Response(
        JSON.stringify({ error: 'Voice ID is required' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      return new Response(
        JSON.stringify({ error: 'AWS credentials are not configured' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Set up the request to Amazon Polly
    const pollyEndpoint = `https://polly.${AWS_REGION}.amazonaws.com/v1/speech`;
    
    // Request parameters
    const requestBody = JSON.stringify({
      Engine: options?.engine || 'neural',
      LanguageCode: options?.language || 'en-US',
      OutputFormat: 'mp3',
      SampleRate: options?.sampleRate || '22050',
      Text: textContent,
      TextType: 'text',
      VoiceId: voiceId
    });

    // Create AWS Signature v4
    const date = new Date();
    const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.substring(0, 8);

    // Create canonical request
    const method = 'POST';
    const canonicalUri = '/v1/speech';
    const canonicalQueryString = '';
    const canonicalHeaders = 
      `content-type:application/json\n` +
      `host:polly.${AWS_REGION}.amazonaws.com\n` +
      `x-amz-date:${amzDate}\n`;
    const signedHeaders = 'content-type;host;x-amz-date';
    
    // Create the SHA256 hash of the request body content
    const encoder = new TextEncoder();
    const data = encoder.encode(requestBody);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const payloadHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Create the canonical request hash
    const canonicalRequest = `${method}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
    const canonicalRequestHashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(canonicalRequest));
    const canonicalRequestHashArray = Array.from(new Uint8Array(canonicalRequestHashBuffer));
    const canonicalRequestHash = canonicalRequestHashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Create the string to sign
    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${dateStamp}/${AWS_REGION}/polly/aws4_request`;
    const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${canonicalRequestHash}`;

    // Calculate signature
    async function sign(key: ArrayBuffer, msg: string): Promise<ArrayBuffer> {
      const hmac = await crypto.subtle.importKey(
        'raw',
        key,
        { name: 'HMAC', hash: { name: 'SHA-256' } },
        false,
        ['sign']
      );
      return await crypto.subtle.sign('HMAC', hmac, encoder.encode(msg));
    }

    // Get signature key
    async function getSignatureKey(key: string, dateStamp: string, regionName: string, serviceName: string): Promise<ArrayBuffer> {
      const kDate = await sign(encoder.encode(`AWS4${key}`), dateStamp);
      const kRegion = await sign(kDate, regionName);
      const kService = await sign(kRegion, serviceName);
      return await sign(kService, 'aws4_request');
    }

    const signingKey = await getSignatureKey(AWS_SECRET_ACCESS_KEY, dateStamp, AWS_REGION, 'polly');
    const signatureBuffer = await sign(signingKey, stringToSign);
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const signature = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Create authorization header
    const authorizationHeader = `${algorithm} Credential=${AWS_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    console.log('Sending request to Amazon Polly');
    
    const response = await fetch(pollyEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Amz-Date': amzDate,
        'Authorization': authorizationHeader
      },
      body: requestBody
    });

    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = await response.json();
        console.error('Amazon Polly API error:', response.status, JSON.stringify(errorData));
        errorMessage = `Polly error: ${errorData.message || response.statusText}`;
      } catch (e) {
        errorMessage = `Failed to generate audio: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    console.log('Audio generated successfully');

    // Get the audio data and upload to storage
    const audioBuffer = await response.arrayBuffer();
    console.log(`Received audio buffer of size: ${audioBuffer.byteLength} bytes`);
    
    // Upload to Supabase Storage
    const filename = `polly-${Date.now()}.mp3`;
    const publicUrl = await uploadAudioFile(filename, audioBuffer);

    return new Response(
      JSON.stringify({ 
        audioUrl: publicUrl,
        provider: "amazon-polly",
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error.message, error.stack);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

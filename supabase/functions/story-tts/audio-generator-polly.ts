
/**
 * Generates audio using AWS Polly API
 */
export async function generateAudioPolly(
  story: { content: string; title: string | null },
  voiceId: string,
  options?: {
    engine?: 'standard' | 'neural';
    language?: string;
    sampleRate?: string;
  }
): Promise<ArrayBuffer> {
  // Check if AWS credentials are set
  const awsAccessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID')
  const awsSecretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY')
  const awsRegion = Deno.env.get('AWS_REGION') || 'us-east-1'
  
  if (!awsAccessKeyId || !awsSecretAccessKey) {
    throw new Error('AWS credentials environment variables are not set')
  }

  // Prepare text for TTS
  const text = `${story.title ? story.title + ". " : ""}${story.content}`
  console.log(`Text prepared for TTS, length: ${text.length} characters`)

  // Use options or defaults
  const engine = options?.engine || 'neural';
  const language = options?.language || 'en-US';
  
  // AWS Signature V4 for Polly
  const service = 'polly';
  const host = `polly.${awsRegion}.amazonaws.com`;
  const endpoint = `https://${host}/v1/speech`;

  // Request parameters
  const requestBody = JSON.stringify({
    Engine: engine,
    LanguageCode: language,
    OutputFormat: 'mp3',
    Text: text,
    TextType: 'text',
    VoiceId: voiceId,
  });

  const date = new Date();
  const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.substring(0, 8);

  // Create canonical request
  const method = 'POST';
  const canonicalUri = '/v1/speech';
  const canonicalQueryString = '';
  const canonicalHeaders = 
    `content-type:application/json\n` +
    `host:${host}\n` +
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
  const credentialScope = `${dateStamp}/${awsRegion}/${service}/aws4_request`;
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

  const signingKey = await getSignatureKey(awsSecretAccessKey, dateStamp, awsRegion, service);
  const signatureBuffer = await sign(signingKey, stringToSign);
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signature = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');

  // Create authorization header
  const authorizationHeader = `${algorithm} Credential=${awsAccessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  console.log('Sending request to AWS Polly');
  
  const response = await fetch(endpoint, {
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
      console.error('AWS Polly API error:', response.status, JSON.stringify(errorData));
      errorMessage = errorData.message || `Failed to generate audio: ${response.status} ${response.statusText}`;
    } catch (e) {
      errorMessage = `Failed to generate audio: ${response.status} ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  console.log('Audio generated successfully with Amazon Polly');

  // Get the audio data
  const audioBuffer = await response.arrayBuffer();
  console.log(`Received audio buffer of size: ${audioBuffer.byteLength} bytes`);
  
  return audioBuffer;
}

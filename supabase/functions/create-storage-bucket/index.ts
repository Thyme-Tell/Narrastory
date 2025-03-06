
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

Deno.serve(async (req) => {
  try {
    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceRole)
    
    // Create the book_covers bucket if it doesn't exist
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets()
    
    if (bucketsError) {
      throw bucketsError
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === 'book_covers')
    
    if (!bucketExists) {
      const { error } = await supabase
        .storage
        .createBucket('book_covers', {
          public: true,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
        })
      
      if (error) {
        throw error
      }
    }
    
    return new Response(
      JSON.stringify({ success: true, message: 'Storage bucket verified' }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})

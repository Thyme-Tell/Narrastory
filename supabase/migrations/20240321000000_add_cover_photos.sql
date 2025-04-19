-- Create cover_photos table
CREATE TABLE IF NOT EXISTS cover_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    high_res_url TEXT NOT NULL,
    preview_url TEXT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create storage buckets for cover photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cover-photos', 'cover-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for cover photos bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT
USING (bucket_id = 'cover-photos');

CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'cover-photos');

-- Create index for faster lookups
CREATE INDEX cover_photos_profile_id_idx ON cover_photos(profile_id); 
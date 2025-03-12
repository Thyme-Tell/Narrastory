
-- Create storage bucket for book cover images
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-covers', 'Book Cover Images', true)
ON CONFLICT (id) DO NOTHING;

-- Set RLS policies for the bucket to allow public read access
-- and authenticated write access for users
CREATE POLICY "Public can read book cover images"
ON storage.objects FOR SELECT
USING (bucket_id = 'book-covers');

CREATE POLICY "Authenticated users can upload book cover images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'book-covers' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Authenticated users can update their book cover images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'book-covers' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Authenticated users can delete their book cover images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'book-covers' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

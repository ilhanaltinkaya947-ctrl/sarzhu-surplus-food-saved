-- Create storage bucket for merchant shop images
INSERT INTO storage.buckets (id, name, public)
VALUES ('shop-images', 'shop-images', true);

-- Allow anyone to view shop images (public bucket)
CREATE POLICY "Shop images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'shop-images');

-- Allow authenticated users to upload their own shop images
CREATE POLICY "Users can upload shop images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'shop-images' 
  AND auth.role() = 'authenticated'
);

-- Allow users to update their own shop images
CREATE POLICY "Users can update their own shop images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'shop-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own shop images
CREATE POLICY "Users can delete their own shop images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'shop-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
-- Marketing assets bucket — stores the home-page demo video, its thumbnail,
-- and any other public marketing media. Uploads happen manually via the
-- Supabase dashboard (service role); the app only reads.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'marketing-assets',
  'marketing-assets',
  true,
  209715200, -- 200 MB
  ARRAY['video/mp4', 'video/webm', 'image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view marketing assets"
  ON storage.objects
  AS permissive
  FOR SELECT
  TO public
  USING (bucket_id = 'marketing-assets');

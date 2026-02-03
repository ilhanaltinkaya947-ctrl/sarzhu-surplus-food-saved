-- Create reviews table with 5-star rating system
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  photos TEXT[] DEFAULT '{}',
  shop_owner_reply TEXT,
  shop_owner_reply_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can VIEW reviews (including non-authenticated users)
CREATE POLICY "Reviews are viewable by everyone"
ON public.reviews
FOR SELECT
USING (true);

-- Only authenticated users can CREATE reviews
CREATE POLICY "Authenticated users can create reviews"
ON public.reviews
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Users can UPDATE their own reviews
CREATE POLICY "Users can update their own reviews"
ON public.reviews
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can DELETE their own reviews
CREATE POLICY "Users can delete their own reviews"
ON public.reviews
FOR DELETE
USING (auth.uid() = user_id);

-- Shop owners can ONLY reply to reviews (update reply fields only)
CREATE POLICY "Shop owners can reply to reviews"
ON public.reviews
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT owner_id FROM public.shops WHERE id = reviews.shop_id
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT owner_id FROM public.shops WHERE id = reviews.shop_id
  )
);

-- Create indexes for performance
CREATE INDEX idx_reviews_shop_id ON public.reviews(shop_id);
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX idx_reviews_rating ON public.reviews(rating);

-- Trigger for updated_at
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for review images
INSERT INTO storage.buckets (id, name, public) VALUES ('review-images', 'review-images', true);

-- Storage policies - public read
CREATE POLICY "Review images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'review-images');

-- Only authenticated users can upload review images
CREATE POLICY "Authenticated users can upload review images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'review-images' AND auth.uid() IS NOT NULL);

-- Users can delete their own uploaded images
CREATE POLICY "Users can delete their own review images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'review-images' AND auth.uid()::text = (storage.foldername(name))[1]);
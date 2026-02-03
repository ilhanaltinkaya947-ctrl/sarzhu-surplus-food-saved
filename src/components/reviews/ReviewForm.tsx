import { useState } from "react";
import { Camera, X, Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { validateReviewContent } from "@/lib/contentModeration";
import { StarRating } from "./StarRating";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface ReviewFormProps {
  shopId: string;
  userId: string;
  onReviewSubmitted: () => void;
  onCancel?: () => void;
}

export function ReviewForm({ shopId, userId, onReviewSubmitted, onCancel }: ReviewFormProps) {
  const { t } = useLanguage();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + photos.length > 3) {
      toast.error("Maximum 3 photos allowed");
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    setPhotos((prev) => [...prev, ...validFiles]);
    
    // Create preview URLs
    validFiles.forEach((file) => {
      const url = URL.createObjectURL(file);
      setPhotoPreviewUrls((prev) => [...prev, url]);
    });
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviewUrls[index]);
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadPhotos = async (): Promise<string[]> => {
    const urls: string[] = [];

    for (const file of photos) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error } = await supabase.storage
        .from("review-images")
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("review-images")
        .getPublicUrl(fileName);

      urls.push(urlData.publicUrl);
    }

    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    const validationError = validateReviewContent(comment);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload photos first
      let photoUrls: string[] = [];
      if (photos.length > 0) {
        photoUrls = await uploadPhotos();
      }

      // Insert review
      const { error: insertError } = await supabase.from("reviews").insert({
        shop_id: shopId,
        user_id: userId,
        rating,
        comment: comment.trim() || null,
        photos: photoUrls,
      });

      if (insertError) throw insertError;

      toast.success("Review submitted successfully!");
      onReviewSubmitted();
    } catch (err) {
      console.error("Error submitting review:", err);
      setError("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Rating */}
      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground mb-2">
          Tap to rate
        </p>
        <div className="flex justify-center">
          <StarRating rating={rating} onRatingChange={setRating} size="lg" />
        </div>
      </div>

      {/* Comment */}
      <div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience (optional)"
          className="w-full rounded-xl border border-border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
          rows={3}
          maxLength={1000}
        />
        <p className="text-xs text-muted-foreground text-right mt-1">
          {comment.length}/1000
        </p>
      </div>

      {/* Photo Upload */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border cursor-pointer hover:bg-muted/50 transition-colors">
            <Camera className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Add photos</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoSelect}
              className="hidden"
              disabled={photos.length >= 3}
            />
          </label>
          <span className="text-xs text-muted-foreground">
            {photos.length}/3
          </span>
        </div>

        {/* Photo Previews */}
        <AnimatePresence>
          {photoPreviewUrls.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-2 overflow-x-auto pb-2"
            >
              {photoPreviewUrls.map((url, index) => (
                <motion.div
                  key={url}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative flex-shrink-0"
                >
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="h-20 w-20 rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-white flex items-center justify-center shadow-md"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-border text-muted-foreground font-medium transition-colors hover:bg-muted"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit
            </>
          )}
        </button>
      </div>
    </form>
  );
}

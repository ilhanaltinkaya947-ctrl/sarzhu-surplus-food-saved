import { useState } from "react";
import { User, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { StarRating } from "./StarRating";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  photos: string[];
  shop_owner_reply: string | null;
  shop_owner_reply_at: string | null;
  created_at: string;
  profiles?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface ReviewCardProps {
  review: Review;
  showPhotos?: boolean;
}

export function ReviewCard({ review, showPhotos = true }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const displayName = review.profiles?.display_name || "Anonymous";
  const avatarUrl = review.profiles?.avatar_url;
  const hasLongComment = review.comment && review.comment.length > 150;
  const displayComment = hasLongComment && !expanded
    ? review.comment?.slice(0, 150) + "..."
    : review.comment;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              <User className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="font-medium text-foreground">{displayName}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        <StarRating rating={review.rating} size="sm" readonly />
      </div>

      {/* Comment */}
      {review.comment && (
        <div>
          <p className="text-sm text-foreground leading-relaxed">{displayComment}</p>
          {hasLongComment && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-sm text-primary font-medium flex items-center gap-1 mt-1"
            >
              {expanded ? (
                <>
                  Show less <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Read more <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Photos */}
      {showPhotos && review.photos && review.photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {review.photos.map((photo, index) => (
            <button
              key={index}
              onClick={() => setSelectedPhoto(photo)}
              className="flex-shrink-0"
            >
              <img
                src={photo}
                alt={`Review photo ${index + 1}`}
                className="h-20 w-20 rounded-lg object-cover hover:opacity-90 transition-opacity"
              />
            </button>
          ))}
        </div>
      )}

      {/* Shop Owner Reply */}
      {review.shop_owner_reply && (
        <div className="ml-4 pl-4 border-l-2 border-primary/30 bg-primary/5 rounded-r-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <MessageCircle className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Owner's response</span>
          </div>
          <p className="text-sm text-muted-foreground">{review.shop_owner_reply}</p>
          {review.shop_owner_reply_at && (
            <p className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(new Date(review.shop_owner_reply_at), { addSuffix: true })}
            </p>
          )}
        </div>
      )}

      {/* Photo Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selectedPhoto}
              alt="Review photo"
              className="max-h-[90vh] max-w-full rounded-lg object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

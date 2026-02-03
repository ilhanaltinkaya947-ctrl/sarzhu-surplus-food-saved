import { useState, useEffect } from "react";
import { Star, Plus, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StarRating } from "./StarRating";
import { ReviewForm } from "./ReviewForm";
import { ReviewCard } from "./ReviewCard";
import { useLanguage } from "@/contexts/LanguageContext";
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

interface ReviewSectionProps {
  shopId: string;
  userId: string | null;
}

export function ReviewSection({ shopId, userId }: ReviewSectionProps) {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("shop_id", shopId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for each unique user
      const userIds = [...new Set((data || []).map(r => r.user_id))];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      const profilesMap = new Map(
        (profilesData || []).map(p => [p.user_id, { display_name: p.display_name, avatar_url: p.avatar_url }])
      );

      const reviewsWithProfiles = (data || []).map(r => ({
        ...r,
        profiles: profilesMap.get(r.user_id),
      }));

      setReviews(reviewsWithProfiles);
      
      // Check if current user has already reviewed
      if (userId) {
        setUserHasReviewed(data?.some((r) => r.user_id === userId) || false);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [shopId, userId]);

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: reviews.length > 0
      ? (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100
      : 0,
  }));

  const handleReviewSubmitted = () => {
    setShowForm(false);
    fetchReviews();
  };

  if (loading) {
    return (
      <div className="py-8 flex justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Rating Summary */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
            Reviews
          </h3>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold text-foreground">
                {averageRating.toFixed(1)}
              </span>
              <StarRating rating={Math.round(averageRating)} size="sm" readonly />
              <span className="text-sm text-muted-foreground">
                ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
              </span>
            </div>
          )}
        </div>

        {/* Add Review Button */}
        {userId ? (
          !userHasReviewed && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              Add Review
            </button>
          )
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <LogIn className="h-4 w-4" />
            Sign in to review
          </div>
        )}
      </div>

      {/* Rating Distribution */}
      {reviews.length > 0 && (
        <div className="space-y-2 bg-muted/50 rounded-xl p-4">
          {ratingCounts.map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-4">{rating}</span>
              <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground w-8">{count}</span>
            </div>
          ))}
        </div>
      )}

      {/* Review Form */}
      <AnimatePresence>
        {showForm && userId && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-border bg-card p-4">
              <h4 className="font-medium text-foreground mb-4">Write a review</h4>
              <ReviewForm
                shopId={shopId}
                userId={userId}
                onReviewSubmitted={handleReviewSubmitted}
                onCancel={() => setShowForm(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 rounded-xl border-2 border-dashed border-border">
          <Star className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-muted-foreground">No reviews yet</p>
          {userId && !userHasReviewed && (
            <p className="text-sm text-muted-foreground mt-1">Be the first to review!</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}

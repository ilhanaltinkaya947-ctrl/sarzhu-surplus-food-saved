import { useState, useEffect, useCallback } from "react";
import { Star, MessageCircle, Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { validateReplyContent } from "@/lib/contentModeration";
import { StarRating } from "@/components/reviews/StarRating";
import { Shop } from "@/contexts/MarketplaceContext";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface Review {
  id: string;
  user_id: string;
  shop_id: string;
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

interface ReviewsTabProps {
  shop: Shop;
  allShops?: Shop[];
}

export function ReviewsTab({ shop, allShops }: ReviewsTabProps) {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const shopIds = allShops && allShops.length > 0 
    ? allShops.map(s => s.id) 
    : [shop.id];

  const fetchReviews = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .in("shop_id", shopIds)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for each unique user
      const userIds = [...new Set((data || []).map(r => r.user_id))];
      let reviewsWithProfiles = data || [];
      
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("user_id, display_name, avatar_url")
          .in("user_id", userIds);

        const profilesMap = new Map(
          (profilesData || []).map(p => [p.user_id, { display_name: p.display_name, avatar_url: p.avatar_url }])
        );

        reviewsWithProfiles = (data || []).map(r => ({
          ...r,
          profiles: profilesMap.get(r.user_id),
        }));
      }

      setReviews(reviewsWithProfiles);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  }, [shopIds]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleReply = async (reviewId: string) => {
    setReplyError(null);

    const error = validateReplyContent(replyText);
    if (error) {
      setReplyError(error);
      return;
    }

    setSubmitting(true);

    try {
      const { error: updateError } = await supabase
        .from("reviews")
        .update({
          shop_owner_reply: replyText.trim(),
          shop_owner_reply_at: new Date().toISOString(),
        })
        .eq("id", reviewId);

      if (updateError) throw updateError;

      toast.success("Reply posted successfully!");
      setReplyingTo(null);
      setReplyText("");
      fetchReviews();
    } catch (err) {
      console.error("Error posting reply:", err);
      toast.error("Failed to post reply");
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const unrepliedCount = reviews.filter(r => !r.shop_owner_reply).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border-2 border-border bg-card p-4 text-center">
          <p className="text-3xl font-bold text-foreground">{reviews.length}</p>
          <p className="text-sm text-muted-foreground">Total Reviews</p>
        </div>
        <div className="rounded-2xl border-2 border-border bg-card p-4 text-center">
          <div className="flex items-center justify-center gap-1">
            <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
            <span className="text-3xl font-bold text-foreground">
              {averageRating.toFixed(1)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Average</p>
        </div>
        <div className="rounded-2xl border-2 border-border bg-card p-4 text-center">
          <p className="text-3xl font-bold text-foreground">{unrepliedCount}</p>
          <p className="text-sm text-muted-foreground">Awaiting Reply</p>
        </div>
      </div>

      {/* Reviews List */}
      <div>
        <h2 className="text-lg font-bold mb-4">Customer Reviews</h2>

        {reviews.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center">
            <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No reviews yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {reviews.map((review) => {
                const shopName = allShops?.find(s => s.id === review.shop_id)?.name || shop.name;
                const displayName = review.profiles?.display_name || "Anonymous";

                return (
                  <motion.div
                    key={review.id}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border-2 border-border bg-card p-4 space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-foreground">{displayName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                          {allShops && allShops.length > 1 && (
                            <span className="ml-2 px-2 py-0.5 rounded bg-muted">
                              {shopName}
                            </span>
                          )}
                        </p>
                      </div>
                      <StarRating rating={review.rating} size="sm" readonly />
                    </div>

                    {/* Comment */}
                    {review.comment && (
                      <p className="text-sm text-foreground">{review.comment}</p>
                    )}

                    {/* Photos */}
                    {review.photos && review.photos.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {review.photos.map((photo, index) => (
                          <img
                            key={index}
                            src={photo}
                            alt={`Review photo ${index + 1}`}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        ))}
                      </div>
                    )}

                    {/* Existing Reply */}
                    {review.shop_owner_reply && (
                      <div className="ml-4 pl-4 border-l-2 border-primary/30 bg-primary/5 rounded-r-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageCircle className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium text-primary">Your response</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.shop_owner_reply}</p>
                      </div>
                    )}

                    {/* Reply Form */}
                    {!review.shop_owner_reply && (
                      <>
                        {replyingTo === review.id ? (
                          <div className="space-y-3 pt-2 border-t border-border">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write your response..."
                              className="w-full rounded-xl border border-border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                              rows={3}
                              maxLength={500}
                            />
                            
                            {replyError && (
                              <p className="text-sm text-destructive bg-destructive/10 rounded-lg p-2">
                                {replyError}
                              </p>
                            )}
                            
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyText("");
                                  setReplyError(null);
                                }}
                                className="flex-1 py-2 rounded-xl border border-border text-muted-foreground text-sm font-medium"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleReply(review.id)}
                                disabled={submitting || !replyText.trim()}
                                className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                {submitting ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <Send className="h-4 w-4" />
                                    Reply
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setReplyingTo(review.id)}
                            className="flex items-center gap-2 text-sm text-primary font-medium hover:underline"
                          >
                            <MessageCircle className="h-4 w-4" />
                            Reply to this review
                          </button>
                        )}
                      </>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

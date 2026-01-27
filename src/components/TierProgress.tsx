import { useTier } from "@/contexts/TierContext";
import { Progress } from "@/components/ui/progress";
import { Crown, Star, Zap } from "lucide-react";

const TIER_ICONS = {
  Joe: Star,
  Shrek: Zap,
  Zeus: Crown,
};

const TIER_DESCRIPTIONS = {
  Joe: "Complete 5 orders to unlock Shrek tier!",
  Shrek: "Complete 20 orders to reach legendary Zeus status!",
  Zeus: "You've reached the highest tier! Enjoy all perks!",
};

export function TierProgress() {
  const { 
    currentTier, 
    completedOrders, 
    nextTierProgress, 
    ordersToNextTier, 
    nextTierName 
  } = useTier();

  const TierIcon = TIER_ICONS[currentTier.name as keyof typeof TIER_ICONS] || Star;

  return (
    <div className="bg-card rounded-2xl p-5 shadow-card">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        {/* Mascot Avatar */}
        <div className="relative">
          <div className="h-16 w-16 rounded-full overflow-hidden border-3 border-primary shadow-lg">
            <img 
              src={currentTier.mascotImage} 
              alt={`${currentTier.name} mascot`}
              className="h-full w-full object-cover"
            />
          </div>
          {/* Tier Badge */}
          <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary flex items-center justify-center shadow-md">
            <TierIcon className="h-4 w-4 text-primary-foreground" />
          </div>
        </div>

        {/* Tier Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-foreground">
              {currentTier.name} Tier
            </h3>
            {currentTier.name === "Zeus" && (
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
                MAX
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {completedOrders} order{completedOrders !== 1 ? 's' : ''} completed
          </p>
        </div>
      </div>

      {/* Progress Section */}
      {nextTierName ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress to {nextTierName}</span>
            <span className="font-semibold text-primary">
              {ordersToNextTier} order{ordersToNextTier !== 1 ? 's' : ''} left
            </span>
          </div>
          <Progress value={nextTierProgress} className="h-2.5" />
        </div>
      ) : (
        <div className="bg-primary/10 rounded-xl p-3 flex items-center gap-3">
          <Crown className="h-5 w-5 text-primary flex-shrink-0" />
          <p className="text-sm text-foreground">
            You've reached the highest tier! Enjoy VIP perks.
          </p>
        </div>
      )}

      {/* Description */}
      <p className="text-xs text-muted-foreground mt-3 text-center">
        {TIER_DESCRIPTIONS[currentTier.name as keyof typeof TIER_DESCRIPTIONS]}
      </p>
    </div>
  );
}

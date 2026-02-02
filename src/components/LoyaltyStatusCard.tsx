import { useTier } from "@/contexts/TierContext";
import { Progress } from "@/components/ui/progress";
import { Crown, Lock, Star, Sparkles, Gift, Percent } from "lucide-react";

// Tier icons mapping
const TIER_ICONS = {
  FoodSaver: Star,
  SmartPicker: Sparkles,
  Legend: Crown,
};

// Next tier benefits
const TIER_BENEFITS = {
  SmartPicker: {
    icon: Sparkles,
    perks: ["AI-powered recommendations", "Personalized deal alerts"],
  },
  Legend: {
    icon: Crown,
    perks: ["20% Lifetime Discount on fees", "First access to limited bags", "Monthly rewards"],
  },
};

export function LoyaltyStatusCard() {
  const { 
    currentTier, 
    completedOrders, 
    nextTierProgress, 
    ordersToNextTier, 
    nextTierName 
  } = useTier();

  const TierIcon = TIER_ICONS[currentTier.name as keyof typeof TIER_ICONS] || Star;
  const isMaxTier = currentTier.name === "Legend";

  // Get the next locked tier info
  const getLockedTierInfo = () => {
    if (currentTier.name === "FoodSaver") {
      return {
        name: "Legend",
        displayName: "Legend",
        ordersRequired: 20,
        ordersRemaining: 20 - completedOrders,
        benefits: TIER_BENEFITS.Legend,
      };
    } else if (currentTier.name === "SmartPicker") {
      return {
        name: "Legend",
        displayName: "Legend",
        ordersRequired: 20,
        ordersRemaining: 20 - completedOrders,
        benefits: TIER_BENEFITS.Legend,
      };
    }
    return null;
  };

  const lockedTier = getLockedTierInfo();

  return (
    <div className="bg-card rounded-2xl shadow-card overflow-hidden">
      {/* Header Section */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-4">
          {/* Current Tier Avatar */}
          <div className="relative">
            <div className="h-14 w-14 rounded-full overflow-hidden border-3 border-primary shadow-lg">
              <img 
                src={currentTier.mascotImage} 
                alt="Joe mascot"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-md">
              <TierIcon className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
          </div>

          {/* Status Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">Loyalty Status</h3>
              {isMaxTier && (
                <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide">
                  MAX
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {currentTier.displayName} • {completedOrders} order{completedOrders !== 1 ? 's' : ''} completed
            </p>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      {nextTierName && (
        <div className="p-5 bg-muted/30">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress to {nextTierName}</span>
            <span className="font-semibold text-primary">
              {completedOrders}/{currentTier.name === "FoodSaver" ? 5 : 20}
            </span>
          </div>
          <Progress value={nextTierProgress} className="h-2.5" />
          <p className="text-xs text-muted-foreground mt-2">
            {ordersToNextTier} more order{ordersToNextTier !== 1 ? 's' : ''} to unlock {nextTierName}
          </p>
        </div>
      )}

      {/* Locked Legend Preview - Show when not Legend */}
      {lockedTier && currentTier.name !== "Legend" && (
        <div className="p-5 border-t border-border">
          <div className="flex items-start gap-3">
            {/* Locked Icon */}
            <div className="relative">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center opacity-50">
                <Crown className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-secondary flex items-center justify-center">
                <Lock className="h-3 w-3 text-muted-foreground" />
              </div>
            </div>

            {/* Locked Tier Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-foreground text-sm">{lockedTier.displayName}</h4>
                <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                  LOCKED
                </span>
              </div>
              
              <p className="text-xs text-muted-foreground mb-3">
                Reach {lockedTier.ordersRequired} orders to unlock
              </p>

              {/* Preview Benefits */}
              <div className="space-y-1.5">
                {lockedTier.benefits.perks.map((perk, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                    {index === 0 ? (
                      <Percent className="h-3 w-3 text-primary/50" />
                    ) : (
                      <Gift className="h-3 w-3 text-primary/50" />
                    )}
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Max Tier Perks - Show when Legend */}
      {isMaxTier && (
        <div className="p-5 bg-primary/10">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Your Active Perks</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card rounded-lg p-2">
              <Percent className="h-3.5 w-3.5 text-primary" />
              <span>20% off fees</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card rounded-lg p-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>First access</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card rounded-lg p-2">
              <Gift className="h-3.5 w-3.5 text-primary" />
              <span>Monthly rewards</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card rounded-lg p-2">
              <Star className="h-3.5 w-3.5 text-primary" />
              <span>VIP status</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

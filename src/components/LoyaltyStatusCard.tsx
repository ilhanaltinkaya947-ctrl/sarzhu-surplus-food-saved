import { useTier } from "@/contexts/TierContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Progress } from "@/components/ui/progress";
import { Crown, Lock, Star, Sparkles, Gift, Percent } from "lucide-react";

const TIER_ICONS = {
  FoodSaver: Star,
  SmartPicker: Sparkles,
  Legend: Crown,
};

export function LoyaltyStatusCard() {
  const { 
    currentTier, 
    completedOrders, 
    nextTierProgress, 
    ordersToNextTier, 
    nextTierName 
  } = useTier();
  const { t } = useLanguage();

  const TierIcon = TIER_ICONS[currentTier.name as keyof typeof TIER_ICONS] || Star;
  const isMaxTier = currentTier.name === "Legend";

  const getTierDisplayName = (tierName: string) => {
    const tierKey = `tier.${tierName.charAt(0).toLowerCase() + tierName.slice(1)}`;
    return t(tierKey) || tierName;
  };

  const TIER_BENEFITS = {
    Legend: {
      perks: [t("tier.lifetimeDiscount"), t("tier.firstAccessBags"), t("tier.monthlyRewards")],
    },
  };

  const getLockedTierInfo = () => {
    if (currentTier.name === "FoodSaver" || currentTier.name === "SmartPicker") {
      return {
        name: "Legend",
        displayName: getTierDisplayName("Legend"),
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
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-4">
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

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">{t("loyalty.status")}</h3>
              {isMaxTier && (
                <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide">
                  {t("general.max")}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {getTierDisplayName(currentTier.name)} • {completedOrders} {completedOrders === 1 ? t("loyalty.orderCompleted") : t("loyalty.ordersCompleted")}
            </p>
          </div>
        </div>
      </div>

      {nextTierName && (
        <div className="p-5 bg-muted/30">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">{t("loyalty.progressTo")} {getTierDisplayName(nextTierName)}</span>
            <span className="font-semibold text-primary">
              {completedOrders}/{currentTier.name === "FoodSaver" ? 5 : 20}
            </span>
          </div>
          <Progress value={nextTierProgress} className="h-2.5" />
          <p className="text-xs text-muted-foreground mt-2">
            {ordersToNextTier} {ordersToNextTier === 1 ? t("loyalty.moreOrder") : t("loyalty.moreOrders")} {getTierDisplayName(nextTierName)}
          </p>
        </div>
      )}

      {lockedTier && currentTier.name !== "Legend" && (
        <div className="p-5 border-t border-border">
          <div className="flex items-start gap-3">
            <div className="relative">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center opacity-50">
                <Crown className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-secondary flex items-center justify-center">
                <Lock className="h-3 w-3 text-muted-foreground" />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-foreground text-sm">{lockedTier.displayName}</h4>
                <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                  {t("loyalty.locked")}
                </span>
              </div>
              
              <p className="text-xs text-muted-foreground mb-3">
                {t("loyalty.reachOrders").replace("{count}", String(lockedTier.ordersRequired))}
              </p>

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

      {isMaxTier && (
        <div className="p-5 bg-primary/10">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">{t("loyalty.activePerks")}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card rounded-lg p-2">
              <Percent className="h-3.5 w-3.5 text-primary" />
              <span>{t("loyalty.offFees")}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card rounded-lg p-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>{t("loyalty.firstAccess")}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card rounded-lg p-2">
              <Gift className="h-3.5 w-3.5 text-primary" />
              <span>{t("loyalty.monthlyRewards")}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card rounded-lg p-2">
              <Star className="h-3.5 w-3.5 text-primary" />
              <span>{t("loyalty.vipStatus")}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

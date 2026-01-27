import { Progress } from "@/components/ui/progress";
import { Dog, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TreatTrackerProps {
  points: number;
  tier: string;
  className?: string;
}

const TIERS = [
  { name: "New Pup", minPoints: 0, emoji: "🐾", icon: null },
  { name: "Top Dog", minPoints: 5, emoji: "🐕", icon: Dog, perk: "Early Access" },
  { name: "Pack Leader", minPoints: 20, emoji: "👑", icon: Crown, perk: "20% Off Fees" },
];

export function TreatTracker({ points, tier, className }: TreatTrackerProps) {
  // Calculate progress percentage (max 20 points for Pack Leader)
  const maxPoints = 20;
  const progressPercent = Math.min((points / maxPoints) * 100, 100);
  
  // Calculate next tier info
  const currentTierIndex = TIERS.findIndex(t => t.name === tier);
  const nextTier = currentTierIndex < TIERS.length - 1 ? TIERS[currentTierIndex + 1] : null;
  const pointsToNext = nextTier ? nextTier.minPoints - points : 0;

  // Joe's dynamic message based on tier
  const getJoeMessage = () => {
    if (points >= 20) {
      return "Bow wow! You're the Boss now. 20% Fees removed! 👑";
    } else if (points >= 5) {
      return `Good boy! Early Access is UNLOCKED. Sniff out ${20 - points} more to be a Leader. 🦴`;
    } else {
      return `Joe says: ${5 - points} more rescues to reach Top Dog status! Yip! 🐾`;
    }
  };

  return (
    <div className={cn("bg-card rounded-2xl p-4 shadow-card", className)}>
      {/* Header with Joe mascot */}
      <div className="flex items-center gap-3 mb-4">
        {/* Joe avatar - Yorkshire Terrier emoji representation */}
        <div className="h-12 w-12 rounded-full bg-[#FFB800]/20 flex items-center justify-center text-2xl">
          🐕
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-foreground">Joe's Treat Tracker</h3>
          <p className="text-sm text-muted-foreground">
            {tier} • {points} points
          </p>
        </div>
        {/* Bone icon as points indicator */}
        <div className="flex items-center gap-1 bg-[#FFB800]/20 px-3 py-1.5 rounded-full">
          <span className="text-lg">🦴</span>
          <span className="font-bold text-[#FFB800]">{points}</span>
        </div>
      </div>

      {/* Progress bar with tier markers */}
      <div className="relative mb-6">
        {/* Tier markers */}
        <div className="flex justify-between mb-2 text-xs text-muted-foreground">
          {TIERS.map((t, i) => (
            <div 
              key={t.name}
              className={cn(
                "flex flex-col items-center transition-colors",
                points >= t.minPoints ? "text-[#FFB800]" : "text-muted-foreground"
              )}
              style={{ 
                position: i === 0 ? 'relative' : 'absolute',
                left: i === 0 ? 0 : `${(t.minPoints / maxPoints) * 100}%`,
                transform: i > 0 ? 'translateX(-50%)' : 'none'
              }}
            >
              <span className="text-lg">{t.emoji}</span>
              <span className="whitespace-nowrap font-medium">{t.minPoints} pts</span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="relative mt-8">
          <Progress 
            value={progressPercent} 
            className="h-3 bg-secondary"
          />
          {/* Joe marker on progress */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 transition-all duration-500"
            style={{ left: `calc(${progressPercent}% - 12px)` }}
          >
            <div className="h-6 w-6 rounded-full bg-[#FFB800] flex items-center justify-center shadow-md text-sm">
              🐕
            </div>
          </div>
        </div>
      </div>

      {/* Joe's message */}
      <div className="bg-[#FFB800]/10 rounded-xl p-3 border border-[#FFB800]/20">
        <p className="text-sm text-foreground font-medium">
          {getJoeMessage()}
        </p>
      </div>

      {/* Perks unlocked section */}
      {points >= 5 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 bg-green-500/10 text-green-600 px-3 py-1.5 rounded-full text-xs font-semibold">
            <span>✓</span>
            <span>Early Access</span>
          </div>
          {points >= 20 && (
            <div className="flex items-center gap-1.5 bg-[#FFB800]/20 text-[#FFB800] px-3 py-1.5 rounded-full text-xs font-semibold">
              <Crown className="h-3 w-3" />
              <span>20% Off Fees</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

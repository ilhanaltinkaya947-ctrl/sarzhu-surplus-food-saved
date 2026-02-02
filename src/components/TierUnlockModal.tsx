import { motion, AnimatePresence } from "framer-motion";
import { Crown, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface TierUnlockModalProps {
  open: boolean;
  onClose: () => void;
  tierName: string;
  mascotImage: string;
  perks: string[];
}

export function TierUnlockModal({ 
  open, 
  onClose, 
  tierName, 
  mascotImage,
}: TierUnlockModalProps) {
  const { t } = useLanguage();

  const TIER_CONFIG = {
    SmartPicker: {
      title: t("tierUnlock.levelUp"),
      subtitle: t("tierUnlock.smartPickerUnlocked"),
      emoji: "🎯",
      gradient: "from-amber-600 to-yellow-500",
      accentColor: "text-yellow-300",
      buttonClass: "bg-white text-amber-700 hover:bg-yellow-50",
    },
    Legend: {
      title: t("tierUnlock.legendary"),
      subtitle: t("tierUnlock.legendUnlocked"),
      emoji: "👑",
      gradient: "from-amber-700 via-yellow-600 to-amber-500",
      accentColor: "text-yellow-200",
      buttonClass: "bg-white text-amber-700 hover:bg-yellow-50",
    },
  };

  const TIER_PERKS = {
    SmartPicker: [
      t("tierUnlock.aiAssistant"),
      t("tierUnlock.aiRecommendations"),
      t("tierUnlock.dealAlerts"),
      t("tierUnlock.earlyNotifications"),
    ],
    Legend: [
      t("tierUnlock.vipStatus"),
      t("tierUnlock.discountFees"),
      t("tierUnlock.limitedBags"),
      t("tierUnlock.monthlyRewards"),
    ],
  };

  const config = TIER_CONFIG[tierName as keyof typeof TIER_CONFIG];
  const perks = TIER_PERKS[tierName as keyof typeof TIER_PERKS] || [];

  if (!config) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 bg-gradient-to-b ${config.gradient}`}
          />

          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-2 h-2 rounded-full bg-yellow-300 opacity-30`}
                initial={{ 
                  x: Math.random() * window.innerWidth, 
                  y: window.innerHeight + 20 
                }}
                animate={{ 
                  y: -20,
                  transition: { 
                    duration: 3 + Math.random() * 2, 
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }
                }}
                style={{
                  left: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>

          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>

          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative z-10 flex flex-col items-center text-center max-w-sm w-full"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className={`mb-4 ${config.accentColor}`}
            >
              {tierName === "Legend" ? (
                <Crown className="h-12 w-12" />
              ) : (
                <Sparkles className="h-12 w-12" />
              )}
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="relative mb-6"
            >
              <div className="absolute inset-0 rounded-full bg-yellow-300 blur-xl opacity-50" />
              
              <div className="relative h-32 w-32 rounded-full border-4 border-white/30 overflow-hidden shadow-2xl">
                <img 
                  src={mascotImage} 
                  alt="Joe"
                  className="h-full w-full object-cover"
                />
              </div>

              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-2 -right-2 text-4xl"
              >
                {config.emoji}
              </motion.span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold text-white mb-2"
            >
              {config.title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={`text-lg font-medium ${config.accentColor} mb-6`}
            >
              {config.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="w-full bg-white/10 rounded-2xl p-4 mb-8 backdrop-blur-sm"
            >
              <p className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-wide">
                {t("tierUnlock.yourPerks")}
              </p>
              <ul className="space-y-2">
                {perks.map((perk, index) => (
                  <motion.li
                    key={perk}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="text-white text-sm text-left"
                  >
                    {perk}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="w-full"
            >
              <Button
                onClick={onClose}
                className={`w-full h-14 text-lg font-bold rounded-xl ${config.buttonClass}`}
              >
                {t("tierUnlock.letsGo")}
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

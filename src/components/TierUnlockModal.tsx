import { motion, AnimatePresence } from "framer-motion";
import { Crown, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TierUnlockModalProps {
  open: boolean;
  onClose: () => void;
  tierName: string;
  mascotImage: string;
  perks: string[];
}

const TIER_CONFIG = {
  Shrek: {
    title: "Welcome to the Pack!",
    subtitle: "You've unlocked Shrek tier",
    emoji: "🐕",
    gradient: "from-gray-900 to-gray-700",
    accentColor: "text-white",
    buttonClass: "bg-white text-black hover:bg-gray-100",
  },
  Zeus: {
    title: "LEGENDARY STATUS!",
    subtitle: "You've ascended to Zeus tier",
    emoji: "⚡",
    gradient: "from-cyan-900 via-blue-900 to-slate-900",
    accentColor: "text-cyan-400",
    buttonClass: "bg-cyan-400 text-black hover:bg-cyan-300",
  },
};

const TIER_PERKS = {
  Shrek: [
    "🎯 Priority access to new deals",
    "🏷️ Exclusive member discounts",
    "⭐ Early notifications for popular items",
  ],
  Zeus: [
    "👑 VIP status with all perks",
    "💰 20% off all service fees",
    "🚀 First access to limited bags",
    "🎁 Monthly surprise rewards",
  ],
};

export function TierUnlockModal({ 
  open, 
  onClose, 
  tierName, 
  mascotImage,
}: TierUnlockModalProps) {
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute inset-0 bg-gradient-to-b ${config.gradient}`}
          />

          {/* Animated particles background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-2 h-2 rounded-full ${config.accentColor} opacity-30`}
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

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>

          {/* Content */}
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative z-10 flex flex-col items-center text-center max-w-sm w-full"
          >
            {/* Crown/Sparkles icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className={`mb-4 ${config.accentColor}`}
            >
              {tierName === "Zeus" ? (
                <Crown className="h-12 w-12" />
              ) : (
                <Sparkles className="h-12 w-12" />
              )}
            </motion.div>

            {/* Mascot Image */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="relative mb-6"
            >
              {/* Glow ring */}
              <div className={`absolute inset-0 rounded-full ${config.accentColor} blur-xl opacity-50`} />
              
              {/* Mascot container */}
              <div className="relative h-32 w-32 rounded-full border-4 border-white/30 overflow-hidden shadow-2xl">
                <img 
                  src={mascotImage} 
                  alt={tierName}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Floating emoji */}
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-2 -right-2 text-4xl"
              >
                {config.emoji}
              </motion.span>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold text-white mb-2"
            >
              {config.title}
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className={`text-lg font-medium ${config.accentColor} mb-6`}
            >
              {config.subtitle}
            </motion.p>

            {/* Perks list */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="w-full bg-white/10 rounded-2xl p-4 mb-8 backdrop-blur-sm"
            >
              <p className="text-sm font-semibold text-white/70 mb-3 uppercase tracking-wide">
                Your New Perks
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

            {/* CTA Button */}
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
                Let's Go! 🚀
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

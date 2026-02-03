import { useTier } from "@/contexts/TierContext";
import { motion } from "framer-motion";
import { GripVertical } from "lucide-react";

const ONBOARDING_KEY = "hasSeenOnboarding";

export function DevDebugMenu() {
  const { setCompletedOrders, currentTier, completedOrders } = useTier();

  const isMerchantPage = window.location.pathname.includes("/merchant");

  const handleReplayIntro = () => {
    localStorage.removeItem(ONBOARDING_KEY);
    window.location.reload();
  };

  const handleMerchantToggle = () => {
    if (isMerchantPage) {
      window.location.href = "/";
    } else {
      window.location.href = "/merchant/dashboard";
    }
  };

  // Hide on merchant pages to avoid overlap with merchant tabs
  if (isMerchantPage) {
    return (
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.1}
        whileDrag={{ scale: 1.05, cursor: "grabbing" }}
        className="fixed top-20 right-4 z-[100] bg-black/60 backdrop-blur-sm rounded-lg p-2 flex flex-col gap-1.5 cursor-grab active:cursor-grabbing touch-none"
        style={{ touchAction: "none" }}
      >
        <div className="flex items-center gap-1">
          <GripVertical className="h-3 w-3 text-white/40" />
          <span className="text-[10px] text-white/60 font-mono">Dev</span>
        </div>
        <button
          onClick={handleMerchantToggle}
          className="px-2 py-1 text-xs rounded bg-emerald-500 text-white hover:bg-emerald-600 transition-all font-semibold"
        >
          🏠 Exit
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.1}
      whileDrag={{ scale: 1.05, cursor: "grabbing" }}
      className="fixed top-4 left-4 z-[100] bg-black/60 backdrop-blur-sm rounded-lg p-2 flex flex-col gap-1.5 cursor-grab active:cursor-grabbing touch-none"
      style={{ touchAction: "none" }}
    >
      <div className="flex items-center gap-1">
        <GripVertical className="h-3 w-3 text-white/40" />
        <span className="text-[10px] text-white/60 font-mono">
          Dev: {currentTier.displayName} ({completedOrders})
        </span>
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => setCompletedOrders(0)}
          className={`px-2 py-1 text-xs rounded transition-all ${
            currentTier.name === 'FoodSaver' 
              ? 'bg-yellow-500 text-black font-semibold' 
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          🐶 Saver
        </button>
        <button
          onClick={() => setCompletedOrders(5)}
          className={`px-2 py-1 text-xs rounded transition-all ${
            currentTier.name === 'SmartPicker' 
              ? 'bg-yellow-500 text-black font-semibold' 
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          🎯 Smart
        </button>
        <button
          onClick={() => setCompletedOrders(20)}
          className={`px-2 py-1 text-xs rounded transition-all ${
            currentTier.name === 'Legend' 
              ? 'bg-yellow-500 text-black font-semibold' 
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          👑 Legend
        </button>
      </div>
      {/* Merchant Mode Toggle */}
      <button
        onClick={handleMerchantToggle}
        className="px-2 py-1 text-xs rounded bg-purple-500 text-white hover:bg-purple-600 transition-all font-semibold"
      >
        🏪 Merchant Mode
      </button>
      {/* Replay Intro Button */}
      <button
        onClick={handleReplayIntro}
        className="px-2 py-1 text-xs rounded bg-red-500 text-white hover:bg-red-600 transition-all font-semibold"
      >
        🔄 Replay Intro
      </button>
    </motion.div>
  );
}

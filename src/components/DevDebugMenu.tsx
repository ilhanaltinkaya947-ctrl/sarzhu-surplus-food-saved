import { useTier } from "@/contexts/TierContext";
import { motion } from "framer-motion";
import { GripVertical } from "lucide-react";

export function DevDebugMenu() {
  const { setCompletedOrders, currentTier, completedOrders } = useTier();

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
          Dev: {currentTier.name} ({completedOrders})
        </span>
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => setCompletedOrders(0)}
          className={`px-2 py-1 text-xs rounded transition-all ${
            currentTier.name === 'Joe' 
              ? 'bg-yellow-500 text-black font-semibold' 
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          🐶 Joe
        </button>
        <button
          onClick={() => setCompletedOrders(5)}
          className={`px-2 py-1 text-xs rounded transition-all ${
            currentTier.name === 'Shrek' 
              ? 'bg-white text-black font-semibold' 
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          🐻 Shrek
        </button>
        <button
          onClick={() => setCompletedOrders(20)}
          className={`px-2 py-1 text-xs rounded transition-all ${
            currentTier.name === 'Zeus' 
              ? 'bg-cyan-400 text-black font-semibold' 
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          🐺 Zeus
        </button>
      </div>
    </motion.div>
  );
}

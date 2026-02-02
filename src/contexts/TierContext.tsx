import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import confetti from "canvas-confetti";

// Import mascot images for each tier
import joeMascot from "@/assets/joe-mascot.png";
import smartPickerMascot from "@/assets/smart-picker-mascot.png";
import legendMascot from "@/assets/legend-mascot.png";

export interface TierInfo {
  name: string;
  displayName: string;
  mascotImage: string;
  minOrders: number;
  maxOrders: number | null;
  perk: string | null;
}

const TIERS: TierInfo[] = [
  {
    name: "FoodSaver",
    displayName: "Food Saver",
    mascotImage: joeMascot,
    minOrders: 0,
    maxOrders: 4,
    perk: null,
  },
  {
    name: "SmartPicker",
    displayName: "Smart Picker",
    mascotImage: smartPickerMascot,
    minOrders: 5,
    maxOrders: 19,
    perk: "AI Personalization",
  },
  {
    name: "Legend",
    displayName: "Legend",
    mascotImage: legendMascot,
    minOrders: 20,
    maxOrders: null,
    perk: "20% Lifetime Discount",
  },
];

// Confetti configurations for tier unlocks
const TIER_CONFETTI = {
  SmartPicker: {
    colors: ["#FFB800", "#F59E0B", "#FBBF24", "#FCD34D"],
    message: "You've unlocked Smart Picker! 🎉",
  },
  Legend: {
    colors: ["#FFB800", "#F59E0B", "#FBBF24", "#FCD34D", "#FFFFFF"],
    message: "LEGENDARY STATUS! 👑🎉",
  },
};

const fireTierConfetti = (tierName: "SmartPicker" | "Legend") => {
  const config = TIER_CONFETTI[tierName];
  
  // First burst - center explosion
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: config.colors,
  });

  // Second burst - left side
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: config.colors,
    });
  }, 150);

  // Third burst - right side
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: config.colors,
    });
  }, 300);

  // Legend gets extra dramatic confetti
  if (tierName === "Legend") {
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors: config.colors,
        scalar: 1.2,
      });
    }, 500);
  }
};

interface TierContextType {
  currentTier: TierInfo;
  completedOrders: number;
  nextTierProgress: number;
  ordersToNextTier: number;
  nextTierName: string | null;
  setCompletedOrders: (orders: number) => void;
  incrementOrders: () => void;
  cycleTierForDebug: () => void;
  unlockModalOpen: boolean;
  unlockedTier: TierInfo | null;
  closeUnlockModal: () => void;
}

const TierContext = createContext<TierContextType | undefined>(undefined);

export function TierProvider({ children }: { children: ReactNode }) {
  // Persist completed orders in localStorage
  const [completedOrders, setCompletedOrdersState] = useState(() => {
    const stored = localStorage.getItem("gou_completed_orders");
    return stored ? parseInt(stored, 10) : 0;
  });
  
  // Track previous tier for celebration detection
  const previousTierRef = useRef<string | null>(null);
  const isInitialMount = useRef(true);
  
  // Modal state for tier unlock celebration
  const [unlockModalOpen, setUnlockModalOpen] = useState(false);
  const [unlockedTier, setUnlockedTier] = useState<TierInfo | null>(null);

  // Calculate current tier based on completed orders
  const currentTier = TIERS.find(
    (tier) =>
      completedOrders >= tier.minOrders &&
      (tier.maxOrders === null || completedOrders <= tier.maxOrders)
  ) || TIERS[0];

  // Calculate progress to next tier
  const currentTierIndex = TIERS.findIndex((t) => t.name === currentTier.name);
  const nextTier = currentTierIndex < TIERS.length - 1 ? TIERS[currentTierIndex + 1] : null;
  
  const ordersToNextTier = nextTier ? nextTier.minOrders - completedOrders : 0;
  
  const nextTierProgress = nextTier
    ? ((completedOrders - currentTier.minOrders) / (nextTier.minOrders - currentTier.minOrders)) * 100
    : 100;

  // Detect tier changes and celebrate!
  useEffect(() => {
    if (isInitialMount.current) {
      previousTierRef.current = currentTier.name;
      isInitialMount.current = false;
      return;
    }

    if (previousTierRef.current && previousTierRef.current !== currentTier.name) {
      // Tier changed! Check if it's an upgrade
      const prevIndex = TIERS.findIndex(t => t.name === previousTierRef.current);
      const currIndex = TIERS.findIndex(t => t.name === currentTier.name);
      
      if (currIndex > prevIndex) {
        // It's a tier upgrade! Celebrate!
        if (currentTier.name === "SmartPicker" || currentTier.name === "Legend") {
          fireTierConfetti(currentTier.name);
          
          // Haptic feedback for mobile devices
          if (navigator.vibrate) {
            if (currentTier.name === "Legend") {
              navigator.vibrate([100, 50, 100, 50, 200]); // Dramatic pattern
            } else {
              navigator.vibrate([50, 30, 100]); // Quick celebratory pattern
            }
          }
          
          // Show unlock modal
          setUnlockedTier(currentTier);
          setUnlockModalOpen(true);
        }
      }
    }
    
    previousTierRef.current = currentTier.name;
  }, [currentTier]);

  // Persist orders to localStorage
  const setCompletedOrders = useCallback((orders: number) => {
    setCompletedOrdersState(orders);
    localStorage.setItem("gou_completed_orders", orders.toString());
  }, []);

  const incrementOrders = useCallback(() => {
    setCompletedOrders(completedOrders + 1);
  }, [completedOrders, setCompletedOrders]);

  // Debug: cycle through tiers
  const cycleTierForDebug = useCallback(() => {
    if (completedOrders < 5) {
      setCompletedOrders(5); // Jump to Smart Picker
    } else if (completedOrders < 20) {
      setCompletedOrders(20); // Jump to Legend
    } else {
      setCompletedOrders(0); // Reset to Food Saver
    }
  }, [completedOrders, setCompletedOrders]);

  const closeUnlockModal = useCallback(() => {
    setUnlockModalOpen(false);
    setUnlockedTier(null);
  }, []);

  return (
    <TierContext.Provider
      value={{
        currentTier,
        completedOrders,
        nextTierProgress,
        ordersToNextTier,
        nextTierName: nextTier?.displayName || null,
        setCompletedOrders,
        incrementOrders,
        cycleTierForDebug,
        unlockModalOpen,
        unlockedTier,
        closeUnlockModal,
      }}
    >
      {children}
    </TierContext.Provider>
  );
}

export function useTier() {
  const context = useContext(TierContext);
  if (context === undefined) {
    throw new Error("useTier must be used within a TierProvider");
  }
  return context;
}

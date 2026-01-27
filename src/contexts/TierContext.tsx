import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import confetti from "canvas-confetti";
import { toast } from "sonner";

// Import mascot images
import joeMascot from "@/assets/joe-mascot.png";
import shrekMascot from "@/assets/shrek-mascot.png";
import zeusMascot from "@/assets/zeus-mascot.png";

// Mascot paths
const MASCOTS = {
  joe: joeMascot,
  shrek: shrekMascot,
  zeus: zeusMascot,
};

export interface TierInfo {
  name: string;
  mascot: "joe" | "shrek" | "zeus";
  mascotImage: string;
  minOrders: number;
  maxOrders: number | null;
  colors: {
    primary: string;      // HSL values without hsl() wrapper
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    card: string;
    cardForeground: string;
    border: string;
  };
}

const TIERS: TierInfo[] = [
  {
    name: "Joe",
    mascot: "joe",
    mascotImage: MASCOTS.joe,
    minOrders: 0,
    maxOrders: 4,
    colors: {
      primary: "43 100% 50%",           // #FFB800 Yorkie Gold
      primaryForeground: "215 28% 17%", // #1E293B Yorkie Steel
      secondary: "210 40% 96%",         // Light slate
      secondaryForeground: "215 28% 17%",
      background: "0 0% 100%",          // White
      foreground: "215 28% 17%",        // Yorkie Steel
      muted: "210 40% 96%",
      mutedForeground: "215 16% 47%",
      accent: "43 100% 50%",
      accentForeground: "215 28% 17%",
      card: "0 0% 100%",
      cardForeground: "215 28% 17%",
      border: "214 32% 91%",
    },
  },
  {
    name: "Shrek",
    mascot: "shrek",
    mascotImage: MASCOTS.shrek,
    minOrders: 5,
    maxOrders: 19,
    colors: {
      primary: "0 0% 0%",               // Black
      primaryForeground: "0 0% 100%",   // White
      secondary: "220 14% 96%",         // Light Grey #F3F4F6
      secondaryForeground: "0 0% 0%",
      background: "220 14% 96%",        // Light Grey
      foreground: "0 0% 0%",            // Black
      muted: "220 14% 90%",
      mutedForeground: "220 9% 46%",
      accent: "0 0% 0%",
      accentForeground: "0 0% 100%",
      card: "0 0% 100%",
      cardForeground: "0 0% 0%",
      border: "220 13% 91%",
    },
  },
  {
    name: "Zeus",
    mascot: "zeus",
    mascotImage: MASCOTS.zeus,
    minOrders: 20,
    maxOrders: null,
    colors: {
      primary: "183 100% 50%",          // #00F0FF Electric Cyan
      primaryForeground: "0 0% 0%",     // Black
      secondary: "222 47% 11%",         // Dark Navy #0F172A
      secondaryForeground: "183 100% 50%",
      background: "222 47% 11%",        // Dark Navy
      foreground: "0 0% 100%",          // White
      muted: "217 33% 17%",
      mutedForeground: "215 20% 65%",
      accent: "183 100% 50%",
      accentForeground: "0 0% 0%",
      card: "222 47% 14%",
      cardForeground: "0 0% 100%",
      border: "217 33% 17%",
    },
  },
];

// Confetti configurations for each tier
const TIER_CONFETTI = {
  shrek: {
    colors: ["#000000", "#FFFFFF", "#333333", "#666666"],
    emoji: "🐕",
    message: "You've unlocked Shrek tier! 🎉",
  },
  zeus: {
    colors: ["#00F0FF", "#0099FF", "#FFFFFF", "#00CCFF"],
    emoji: "⚡",
    message: "LEGENDARY! You've unlocked Zeus tier! ⚡👑",
  },
};

const fireTierConfetti = (tierName: "shrek" | "zeus") => {
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

  // Zeus gets extra dramatic confetti
  if (tierName === "zeus") {
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
        if (currentTier.mascot === "shrek" || currentTier.mascot === "zeus") {
          fireTierConfetti(currentTier.mascot);
          
          // Haptic feedback for mobile devices
          if (navigator.vibrate) {
            // Zeus gets a stronger vibration pattern
            if (currentTier.mascot === "zeus") {
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

  // Apply theme via data-theme attribute and CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const colors = currentTier.colors;

    // Set data-theme attribute for CSS tier-specific styles
    document.body.setAttribute('data-theme', currentTier.name.toLowerCase());

    // Also set inline CSS variables as fallback
    root.style.setProperty("--primary", colors.primary);
    root.style.setProperty("--primary-foreground", colors.primaryForeground);
    root.style.setProperty("--secondary", colors.secondary);
    root.style.setProperty("--secondary-foreground", colors.secondaryForeground);
    root.style.setProperty("--background", colors.background);
    root.style.setProperty("--foreground", colors.foreground);
    root.style.setProperty("--muted", colors.muted);
    root.style.setProperty("--muted-foreground", colors.mutedForeground);
    root.style.setProperty("--accent", colors.accent);
    root.style.setProperty("--accent-foreground", colors.accentForeground);
    root.style.setProperty("--card", colors.card);
    root.style.setProperty("--card-foreground", colors.cardForeground);
    root.style.setProperty("--border", colors.border);

    // Update body background for smooth transitions
    document.body.style.backgroundColor = `hsl(${colors.background})`;
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
      setCompletedOrders(5); // Jump to Shrek
    } else if (completedOrders < 20) {
      setCompletedOrders(20); // Jump to Zeus
    } else {
      setCompletedOrders(0); // Reset to Joe
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
        nextTierName: nextTier?.name || null,
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

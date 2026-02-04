import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import MapPage from "./pages/MapPage";
import OrdersPage from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";
import MerchantDashboard from "./pages/MerchantDashboard";
import NotFound from "./pages/NotFound";
import { TierProvider, useTier } from "./contexts/TierContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { BasketProvider } from "./contexts/BasketContext";
import { MarketplaceProvider } from "./contexts/MarketplaceContext";
import { TierUnlockModal } from "./components/TierUnlockModal";
import { OnboardingFlow } from "./components/OnboardingFlow";
import { AnimatePresence } from "framer-motion";

const queryClient = new QueryClient();

const ONBOARDING_KEY = "hasSeenOnboarding";

// Wrapper component to access tier context
function TierUnlockModalWrapper() {
  const { unlockModalOpen, unlockedTier, closeUnlockModal } = useTier();
  
  if (!unlockedTier) return null;
  
  return (
    <TierUnlockModal
      open={unlockModalOpen}
      onClose={closeUnlockModal}
      tierName={unlockedTier.name}
      mascotImage={unlockedTier.mascotImage}
      perks={[]}
    />
  );
}

// Inner app content that needs all providers
function AppContent() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem(ONBOARDING_KEY);
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
    setIsLoading(false);
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowOnboarding(false);
  };

  if (isLoading) {
    return null;
  }

  return (
    <>
      <Toaster />
      <Sonner />
      <TierUnlockModalWrapper />
      
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingFlow onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>
      
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <MarketplaceProvider>
          <TierProvider>
            <BasketProvider>
              <TooltipProvider>
                <AppContent />
              </TooltipProvider>
            </BasketProvider>
          </TierProvider>
        </MarketplaceProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
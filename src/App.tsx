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
import { TierUnlockModal } from "./components/TierUnlockModal";

const queryClient = new QueryClient();

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TierProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <TierUnlockModalWrapper />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MapPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/merchant/dashboard" element={<MerchantDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </TierProvider>
  </QueryClientProvider>
);

export default App;
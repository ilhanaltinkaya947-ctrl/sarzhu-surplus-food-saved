import { useState, useEffect } from "react";
import { AlertCircle, ArrowLeft, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMarketplace } from "@/contexts/MarketplaceContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { MerchantTabs } from "@/components/merchant/MerchantTabs";
import { ProfileTab } from "@/components/merchant/ProfileTab";
import { ProductsTab } from "@/components/merchant/ProductsTab";
import { OrdersTab } from "@/components/merchant/OrdersTab";
import { AnalyticsTab } from "@/components/merchant/AnalyticsTab";
import { LocationSelector } from "@/components/merchant/LocationSelector";
import { AddLocationModal } from "@/components/merchant/AddLocationModal";

export default function MerchantDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { shops, loading: shopsLoading, getUserShops } = useMarketplace();
  const { t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<"profile" | "products" | "orders" | "analytics">("orders");
  const [showAddLocation, setShowAddLocation] = useState(false);

  // Get all shops owned by current user
  const userShops = user ? getUserShops(user.id) : [];
  
  // Use first shop as default, or fallback to first in list for demo
  const [selectedShop, setSelectedShop] = useState(userShops[0] || shops[0] || null);

  // Update selected shop when shops load
  useEffect(() => {
    if (!selectedShop && userShops.length > 0) {
      setSelectedShop(userShops[0]);
    } else if (!selectedShop && shops.length > 0) {
      setSelectedShop(shops[0]);
    }
    // If selected shop was deleted, select another
    if (selectedShop && !shops.find(s => s.id === selectedShop.id)) {
      setSelectedShop(userShops[0] || shops[0] || null);
    }
  }, [shops, userShops, selectedShop]);

  // Keep selected shop in sync with shop updates
  useEffect(() => {
    if (selectedShop) {
      const updatedShop = shops.find(s => s.id === selectedShop.id);
      if (updatedShop && updatedShop !== selectedShop) {
        setSelectedShop(updatedShop);
      }
    }
  }, [shops, selectedShop]);

  const loading = authLoading || shopsLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!selectedShop) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <Store className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-xl font-bold mb-2">{t("merchant.noShopFound")}</h1>
        <p className="text-muted-foreground text-center mb-6">
          {t("merchant.noShopDescription")}
        </p>
        <Link
          to="/"
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
          {t("common.goBack")}
        </Link>
      </div>
    );
  }

  const displayShops = userShops.length > 0 ? userShops : [selectedShop];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center gap-4 px-6 py-4" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
          <Link to="/" className="p-2 -ml-2 rounded-xl hover:bg-secondary touch-target">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold truncate">{selectedShop.name}</h1>
              {displayShops.length > 1 && (
                <LocationSelector
                  shops={displayShops}
                  selectedShop={selectedShop}
                  onSelectShop={setSelectedShop}
                  onAddLocation={() => setShowAddLocation(true)}
                />
              )}
            </div>
            <p className="text-sm text-muted-foreground">{t("merchant.dashboard")}</p>
          </div>
          {displayShops.length === 1 && (
            <button
              onClick={() => setShowAddLocation(true)}
              className="text-xs text-primary font-medium"
            >
              + {t("merchant.addLocation")}
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="px-6 py-6">
        {activeTab === "profile" && <ProfileTab shop={selectedShop} />}
        {activeTab === "products" && <ProductsTab shop={selectedShop} />}
        {activeTab === "orders" && <OrdersTab shop={selectedShop} allShops={displayShops} />}
        {activeTab === "analytics" && <AnalyticsTab shop={selectedShop} allShops={displayShops} />}
      </main>

      {/* Bottom Tabs */}
      <MerchantTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Add Location Modal */}
      <AddLocationModal
        open={showAddLocation}
        onOpenChange={setShowAddLocation}
        onSuccess={() => {
          // The new shop will appear via real-time subscription
        }}
      />
    </div>
  );
}

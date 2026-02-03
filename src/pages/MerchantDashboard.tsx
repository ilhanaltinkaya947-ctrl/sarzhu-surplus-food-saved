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

export default function MerchantDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { shops, loading: shopsLoading } = useMarketplace();
  const { t } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<"profile" | "products" | "orders">("orders");

  // Find shop owned by current user (or use first shop for demo)
  const userShop = shops.find((s) => s.owner_id === user?.id) || shops[0];

  const loading = authLoading || shopsLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!userShop) {
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

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center gap-4 px-6 py-4" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}>
          <Link to="/" className="p-2 -ml-2 rounded-xl hover:bg-secondary touch-target">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">{userShop.name}</h1>
            <p className="text-sm text-muted-foreground">{t("merchant.dashboard")}</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-6 py-6">
        {activeTab === "profile" && <ProfileTab shop={userShop} />}
        {activeTab === "products" && <ProductsTab shop={userShop} />}
        {activeTab === "orders" && <OrdersTab shop={userShop} />}
      </main>

      {/* Bottom Tabs */}
      <MerchantTabs activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

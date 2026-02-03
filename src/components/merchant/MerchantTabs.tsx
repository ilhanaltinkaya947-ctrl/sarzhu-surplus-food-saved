import { Home, Package, Zap, BarChart3, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface MerchantTabsProps {
  activeTab: "profile" | "products" | "orders" | "analytics" | "reviews";
  onTabChange: (tab: "profile" | "products" | "orders" | "analytics" | "reviews") => void;
}

export function MerchantTabs({ activeTab, onTabChange }: MerchantTabsProps) {
  const { t } = useLanguage();

  const tabs = [
    { id: "orders" as const, icon: Zap, labelKey: "merchant.tabs.orders" },
    { id: "products" as const, icon: Package, labelKey: "merchant.tabs.products" },
    { id: "reviews" as const, icon: Star, labelKey: "merchant.tabs.reviews" },
    { id: "analytics" as const, icon: BarChart3, labelKey: "merchant.tabs.analytics" },
    { id: "profile" as const, icon: Home, labelKey: "merchant.tabs.profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div 
        className="flex items-center justify-around"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)', paddingTop: '8px' }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "scale-110")} />
              <span className="text-xs font-medium">{t(tab.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
import { Map, ShoppingBag, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

export function BottomNav() {
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { path: "/", icon: Map, labelKey: "nav.map" },
    { path: "/orders", icon: ShoppingBag, labelKey: "nav.orders" },
    { path: "/profile", icon: User, labelKey: "nav.profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border pb-safe">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center touch-target touch-active transition-colors",
                "px-6 py-2 rounded-xl",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-6 w-6 transition-transform",
                  isActive && "scale-110"
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={cn(
                "text-xs mt-1 font-medium",
                isActive && "font-semibold"
              )}>
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

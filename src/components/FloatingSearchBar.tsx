import { Search, User, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export function FloatingSearchBar() {
  const { t } = useLanguage();
  
  return (
    <div 
      className="absolute left-4 right-4 z-20"
      style={{ top: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
    >
      <div className="flex items-center gap-3 rounded-2xl bg-white/95 backdrop-blur-xl px-4 py-3 shadow-lg">
        <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        <input
          type="text"
          placeholder="Search for food..."
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <Link
          to="/merchant/dashboard"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 touch-active touch-target flex-shrink-0"
          title={t("merchant.switchToMerchant")}
        >
          <Store className="h-5 w-5 text-primary" />
        </Link>
        <Link
          to="/profile"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary touch-active touch-target flex-shrink-0"
        >
          <User className="h-5 w-5 text-foreground" />
        </Link>
      </div>
    </div>
  );
}

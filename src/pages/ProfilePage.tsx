import { useState } from "react";
import { User, Heart, HelpCircle, LogIn, ArrowLeft, Globe, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, PanInfo } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { LoyaltyStatusCard } from "@/components/LoyaltyStatusCard";
import { useTier } from "@/contexts/TierContext";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Average savings per order in KZT
const AVG_SAVINGS_PER_ORDER = 1200;

const languageLabels: Record<Language, string> = {
  en: "English",
  kz: "Қазақша",
  ru: "Русский",
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, loading } = useProfile();
  const { completedOrders } = useTier();
  const { t, language } = useLanguage();
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);

  // Calculate total money saved
  const totalMoneySaved = completedOrders * AVG_SAVINGS_PER_ORDER;
  
  const formatMoneySaved = (amount: number) => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toString();
  };

  const menuItems = [
    { icon: Heart, label: t("profile.savedShops"), count: 0 },
    { icon: Globe, label: t("profile.language"), value: languageLabels[language], onClick: () => setLanguageDialogOpen(true) },
    { icon: HelpCircle, label: t("profile.help") },
  ];

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    
    // If dragged right far enough OR flicked right fast
    if (offset.x > 100 || velocity.x > 500) {
      handleGoBack();
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-background"
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0, right: 0.3 }}
      onDragEnd={handleDragEnd}
    >
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3 pt-safe">
          {/* Back Button */}
          <button
            onClick={handleGoBack}
            className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-foreground" strokeWidth={2.5} />
          </button>
          
          {/* Title */}
          <h1 className="text-lg font-semibold text-foreground">{t("profile.title")}</h1>
          
          {/* Spacer for alignment */}
          <div className="h-10 w-10" />
        </div>
      </header>
      
      <main className="pt-20 pb-24 px-4">
        {/* Loyalty Status Card */}
        <div className="mb-6">
          <LoyaltyStatusCard />
        </div>

        {/* Profile Header */}
        <div className="flex flex-col items-center py-8">
          <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center mb-4">
            <User className="h-12 w-12 text-muted-foreground" />
          </div>
          
          {user ? (
            <>
              <h2 className="text-xl font-semibold text-foreground">
                {profile?.display_name || user.email?.split("@")[0] || "User"}
              </h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={signOut}
              >
                {t("profile.signOut")}
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                {t("profile.guest")}
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-4 max-w-xs">
                {t("profile.signIn")}
              </p>
              <Button className="touch-target gradient-hero text-primary-foreground font-semibold px-8">
                <LogIn className="h-4 w-4 mr-2" />
                {t("profile.signInButton")}
              </Button>
            </>
          )}
        </div>

        {/* Stats - Orders and Money Saved */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-card rounded-2xl p-4 text-center shadow-card">
            <p className="text-2xl font-bold text-primary">{completedOrders}</p>
            <p className="text-xs text-muted-foreground">{t("profile.totalOrders")}</p>
          </div>
          <div className="bg-card rounded-2xl p-4 text-center shadow-card">
            <p className="text-2xl font-bold text-primary">₸{formatMoneySaved(totalMoneySaved)}</p>
            <p className="text-xs text-muted-foreground">{t("profile.moneySaved")}</p>
          </div>
        </div>

        {/* Menu */}
        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="w-full flex items-center justify-between p-4 touch-active border-b border-border last:border-0"
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium text-foreground">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.value && (
                  <span className="text-sm text-muted-foreground">{item.value}</span>
                )}
                {item.count !== undefined && (
                  <span className="text-sm text-muted-foreground">{item.count}</span>
                )}
                {item.onClick && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          Made with 🐾 to reduce food waste
        </p>
      </main>

      {/* Language Selection Dialog */}
      <Dialog open={languageDialogOpen} onOpenChange={setLanguageDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("profile.language")}</DialogTitle>
          </DialogHeader>
          <LanguageSelector />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

import { useState, useEffect } from "react";
import { User, Heart, HelpCircle, LogIn, ArrowLeft, Globe, ChevronRight, ShoppingBag, Clock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, PanInfo } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { LoyaltyStatusCard } from "@/components/LoyaltyStatusCard";
import { useTier } from "@/contexts/TierContext";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { AuthModal } from "@/components/AuthModal";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Order {
  id: string;
  order_number: string | null;
  status: string;
  created_at: string;
  bag_id: string;
}

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
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Fetch user orders
  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;
      
      setOrdersLoading(true);
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("id, order_number, status, created_at, bag_id")
          .order("created_at", { ascending: false })
          .limit(10);
        
        if (error) throw error;
        setOrders(data || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setOrdersLoading(false);
      }
    }
    
    fetchOrders();
  }, [user]);

  // Calculate total money saved
  const totalMoneySaved = completedOrders * AVG_SAVINGS_PER_ORDER;
  
  const formatMoneySaved = (amount: number) => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "ru" ? "ru-RU" : language === "kz" ? "kk-KZ" : "en-US", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "picked_up":
        return { label: t("orders.pickedUp"), color: "text-green-500", bgColor: "bg-green-500/10" };
      case "pending":
        return { label: t("orders.reserved"), color: "text-primary", bgColor: "bg-primary/10" };
      default:
        return { label: status, color: "text-muted-foreground", bgColor: "bg-muted" };
    }
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
              <Button 
                onClick={() => setAuthModalOpen(true)}
                className="touch-target bg-primary text-primary-foreground font-semibold px-8"
              >
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

        {/* Order History */}
        {user && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                {t("profile.orderHistory")}
              </h3>
              <button 
                onClick={() => navigate("/orders")}
                className="text-sm font-medium text-primary"
              >
                {t("bottomSheet.seeAll")}
              </button>
            </div>

            {ordersLoading ? (
              <div className="bg-card rounded-2xl p-8 shadow-card flex items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-card rounded-2xl p-8 shadow-card text-center">
                <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">{t("profile.noOrders")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  const statusInfo = getStatusInfo(order.status);
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card rounded-2xl p-4 shadow-card"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-foreground font-mono">
                            #{order.order_number || "---"}
                          </span>
                        </div>
                        <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                          {order.status === "picked_up" ? (
                            <span className="flex items-center gap-1">
                              <Check className="h-3 w-3" />
                              {statusInfo.label}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {statusInfo.label}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(order.created_at)}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          {t("profile.footer")}
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

      {/* Auth Modal */}
      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
      />
    </motion.div>
  );
}

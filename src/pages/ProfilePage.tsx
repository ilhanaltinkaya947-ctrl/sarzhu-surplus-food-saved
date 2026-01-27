import { User, Settings, Heart, HelpCircle, LogIn, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion, PanInfo } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { TreatTracker } from "@/components/TreatTracker";
import { LoyaltyStatusCard } from "@/components/LoyaltyStatusCard";
import { useTier } from "@/contexts/TierContext";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, loading } = useProfile();
  const { completedOrders } = useTier();

  const menuItems = [
    { icon: Heart, label: "Saved Shops", count: 0 },
    { icon: Settings, label: "Settings" },
    { icon: HelpCircle, label: "Help & Support" },
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
          <h1 className="text-lg font-semibold text-foreground">Profile</h1>
          
          {/* Spacer for alignment */}
          <div className="h-10 w-10" />
        </div>
      </header>
      
      <main className="pt-20 pb-24 px-4">
        {/* Loyalty Status Card - Replaces TierProgress */}
        <div className="mb-6">
          <LoyaltyStatusCard />
        </div>

        {/* Joe's Treat Tracker - Only show when logged in */}
        {user && profile && (
          <div className="mb-6">
            <TreatTracker 
              points={profile.loyalty_points} 
              tier={profile.tier} 
            />
          </div>
        )}

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
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Welcome to Sarzhu
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-4 max-w-xs">
                Sign in to save your favorite shops and view your orders
              </p>
              <Button className="touch-target gradient-hero text-primary-foreground font-semibold px-8">
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-2xl p-4 text-center shadow-card">
            <p className="text-2xl font-bold text-primary">{completedOrders}</p>
            <p className="text-xs text-muted-foreground">Orders</p>
          </div>
          <div className="bg-card rounded-2xl p-4 text-center shadow-card">
            <p className="text-2xl font-bold text-primary">{(completedOrders * 0.8).toFixed(1)} kg</p>
            <p className="text-xs text-muted-foreground">Food Saved</p>
          </div>
          <div className="bg-card rounded-2xl p-4 text-center shadow-card">
            <p className="text-2xl font-bold text-primary">
              🦴 {profile?.loyalty_points || 0}
            </p>
            <p className="text-xs text-muted-foreground">Treats</p>
          </div>
        </div>

        {/* Menu */}
        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center justify-between p-4 touch-active border-b border-border last:border-0"
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium text-foreground">{item.label}</span>
              </div>
              {item.count !== undefined && (
                <span className="text-sm text-muted-foreground">{item.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          Made with 🐾 to reduce food waste
        </p>
      </main>
    </motion.div>
  );
}

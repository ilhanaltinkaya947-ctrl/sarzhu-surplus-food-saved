import { useState } from "react";
import { Clock, MapPin, Heart, X, Loader2, Package, Sparkles, Zap } from "lucide-react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import confetti from "canvas-confetti";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthModal } from "./AuthModal";
import { PickupSuccessScreen } from "./orders/PickupSuccessScreen";
import { useTier } from "@/contexts/TierContext";
import type { User } from "@supabase/supabase-js";

// Service fee constants
const SERVICE_FEE = 200;
const ZEUS_DISCOUNT = 0.20; // 20% off for Zeus tier

interface Shop {
  id: string;
  name: string;
  lat: number;
  long: number;
  image_url: string | null;
  description: string | null;
}

interface MysteryBag {
  id: string;
  shop_id: string;
  quantity_available: number;
  original_price: number;
  discounted_price: number;
}

interface ShopDrawerProps {
  shop: Shop | null;
  bag: MysteryBag | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isFavorite: boolean;
  onToggleFavorite: (shopId: string) => void;
  user: User | null;
  onReservationComplete?: () => void;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-KZ", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(price);
};

export function ShopDrawer({ 
  shop, 
  bag, 
  open, 
  onOpenChange, 
  isFavorite, 
  onToggleFavorite,
  user,
  onReservationComplete,
}: ShopDrawerProps) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [reserving, setReserving] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string>("");
  const { currentTier } = useTier();

  // Check if user is in Legend tier for discount
  const isLegend = currentTier.name === "Legend";
  const discountedServiceFee = isLegend ? Math.round(SERVICE_FEE * (1 - ZEUS_DISCOUNT)) : SERVICE_FEE;

  // Calculate total with service fee
  const calculateTotal = () => {
    if (!bag) return 0;
    return bag.discounted_price + discountedServiceFee;
  };

  if (!shop) return null;

  const discount = bag
    ? Math.round((1 - bag.discounted_price / bag.original_price) * 100)
    : 0;

  const handleFavoriteClick = () => {
    if (!isFavorite) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { x: 0.1, y: 0.2 },
        colors: ['#F59E0B', '#EF4444', '#EC4899', '#8B5CF6'],
        ticks: 150,
        gravity: 1.2,
        scalar: 0.9,
      });
    }
    onToggleFavorite(shop.id);
  };

  const handleReserveClick = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (!bag || bag.quantity_available <= 0) {
      toast.error("Sorry, this bag is sold out!");
      return;
    }

    setReserving(true);

    try {
      const { data: currentBag, error: fetchError } = await supabase
        .from("mystery_bags")
        .select("quantity_available")
        .eq("id", bag.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!currentBag || currentBag.quantity_available <= 0) {
        toast.error("Sorry, this bag just sold out!");
        return;
      }

      const { error: updateError } = await supabase
        .from("mystery_bags")
        .update({ quantity_available: currentBag.quantity_available - 1 })
        .eq("id", bag.id);

      if (updateError) throw updateError;

      const { data: newOrder, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          bag_id: bag.id,
          status: "reserved",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      setConfirmedOrderId(newOrder.id);
      onOpenChange(false);
      setConfirmationOpen(true);
      onReservationComplete?.();

      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#10B981', '#34D399', '#6EE7B7'],
      });

    } catch (error: any) {
      console.error("Reservation error:", error);
      toast.error(error.message || "Failed to reserve. Please try again.");
    } finally {
      setReserving(false);
    }
  };

  const handleAuthSuccess = () => {
    handleReserveClick();
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Close if dragged down more than 100px OR flicked down fast
    if (info.offset.y > 100 || info.velocity.y > 500) {
      handleClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm pointer-events-auto"
            onClick={handleClose}
            onTouchStart={(e) => e.stopPropagation()}
          />
        )}
      </AnimatePresence>

      {/* Super Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300,
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
            className="fixed bottom-0 left-0 right-0 z-50 h-[85dvh] rounded-t-3xl bg-[hsl(var(--sheet-bg))] shadow-2xl overflow-hidden flex flex-col pointer-events-auto transition-colors duration-500"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            {/* Drag Handle - Large hit area */}
            <div className="w-full h-12 flex items-center justify-center cursor-grab active:cursor-grabbing flex-shrink-0 touch-none">
              <div className="w-12 h-1.5 bg-[hsl(var(--sheet-muted))]/30 rounded-full" />
            </div>

            {/* Hero Image */}
            <div className="relative h-56 w-full overflow-hidden flex-shrink-0">
              <img
                src={shop.image_url || "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800"}
                alt={shop.name}
                className="h-full w-full object-cover"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              
              {/* Discount Badge */}
              {discount > 0 && (
                <span className="absolute bottom-4 left-4 rounded-lg bg-destructive px-3 py-1.5 text-sm font-bold text-white shadow-lg">
                  -{discount}% OFF
                </span>
              )}
              
              {/* Favorite Button - Top Left */}
              <button 
                onClick={handleFavoriteClick}
                className="absolute top-4 left-4 flex h-11 w-11 items-center justify-center rounded-full bg-[hsl(var(--sheet-bg))]/95 backdrop-blur-sm shadow-lg touch-active transition-all duration-200 active:scale-95"
              >
                <Heart 
                  className={`h-5 w-5 transition-colors duration-200 ${
                    isFavorite 
                      ? 'fill-red-500 text-red-500' 
                      : 'text-[hsl(var(--sheet-muted))]'
                  }`} 
                />
              </button>
              
              {/* Close Button - Top Right */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-[hsl(var(--sheet-bg))]/95 backdrop-blur-sm shadow-lg touch-active transition-all duration-200 active:scale-95"
              >
                <X className="h-5 w-5 text-[hsl(var(--sheet-foreground))]" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-5 pt-5 pb-4 overscroll-contain">
              {/* Title */}
              <h1 className="text-3xl font-bold text-[hsl(var(--sheet-foreground))] mb-3 transition-colors duration-500">
                {shop.name}
              </h1>

              {/* Status Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1.5 text-sm font-medium text-emerald-500 transition-colors duration-500">
                  <Clock className="h-4 w-4" />
                  Open until 23:00
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--muted))] px-3 py-1.5 text-sm font-medium text-[hsl(var(--sheet-muted))] transition-colors duration-500">
                  <MapPin className="h-4 w-4" />
                  350m away
                </span>
              </div>

              {/* Description */}
              {shop.description && (
                <p className="text-[hsl(var(--sheet-muted))] leading-relaxed mb-6 transition-colors duration-500">
                  {shop.description}
                </p>
              )}

              {/* What's in the bag Section */}
              <div className="mb-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-[hsl(var(--sheet-foreground))] mb-3 transition-colors duration-500">
                  <Sparkles className="h-5 w-5 text-primary transition-colors duration-500" />
                  What's in the bag?
                </h3>
                <div className="rounded-2xl bg-[hsl(var(--info-box-bg))] border border-[hsl(var(--info-box-border))] p-4 transition-colors duration-500">
                  <p className="text-[hsl(var(--sheet-muted))] text-sm transition-colors duration-500">
                    A surprise selection of delicious items that would otherwise go to waste. 
                    Contents vary daily based on what's available!
                  </p>
                </div>
              </div>

              {/* Mystery Bag Card */}
              {bag && (
                <div className="rounded-2xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] p-5 transition-colors duration-500">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/15 transition-colors duration-500">
                      <Package className="h-7 w-7 text-primary transition-colors duration-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-[hsl(var(--sheet-foreground))] text-lg transition-colors duration-500">Mystery Bag</h4>
                        <div className="text-right">
                          <span className="text-sm text-[hsl(var(--sheet-muted))] line-through block transition-colors duration-500">
                            {formatPrice(bag.original_price)}
                          </span>
                          <span className="text-xl font-bold text-primary transition-colors duration-500">
                            {formatPrice(bag.discounted_price)}
                          </span>
                        </div>
                      </div>
                      <p className={`text-sm mt-1 transition-colors duration-500 ${bag.quantity_available > 0 ? 'text-[hsl(var(--sheet-muted))]' : 'text-red-500 font-medium'}`}>
                        {bag.quantity_available > 0 
                          ? `${bag.quantity_available} bags left today` 
                          : 'Sold out for today'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Price Breakdown Section */}
              {bag && (
                <div className="rounded-2xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] p-4 space-y-3 transition-colors duration-500">
                  <h4 className="font-semibold text-[hsl(var(--sheet-foreground))] text-sm transition-colors duration-500">Price Breakdown</h4>
                  
                  {/* Mystery Bag Line */}
                  <div className="flex justify-between text-sm">
                    <span className="text-[hsl(var(--sheet-muted))] transition-colors duration-500">Mystery Bag</span>
                    <span className="text-[hsl(var(--sheet-foreground))] font-medium transition-colors duration-500">
                      {formatPrice(bag.discounted_price)}
                    </span>
                  </div>

                  {/* Service Fee Line */}
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-[hsl(var(--sheet-muted))] transition-colors duration-500">Service Fee</span>
                  <div className="flex items-center gap-2">
                      {isLegend ? (
                        <>
                          <span className="text-[hsl(var(--sheet-muted))] line-through text-xs transition-colors duration-500">
                            {formatPrice(SERVICE_FEE)}
                          </span>
                          <span className="text-primary font-bold transition-colors duration-500">
                            {formatPrice(discountedServiceFee)}
                          </span>
                        </>
                      ) : (
                        <span className="text-[hsl(var(--sheet-foreground))] font-medium transition-colors duration-500">
                          {formatPrice(SERVICE_FEE)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Legend Perk Badge */}
                  {isLegend && (
                    <div className="flex items-center justify-center gap-2 py-2 px-3 bg-primary/15 border border-primary/30 rounded-xl">
                      <Zap className="h-4 w-4 text-primary" />
                      <span className="text-xs font-semibold text-primary">Legend Perk applied 👑</span>
                    </div>
                  )}

                  {/* Total */}
                  <div className="flex justify-between pt-3 border-t border-[hsl(var(--border))]">
                    <span className="font-semibold text-[hsl(var(--sheet-foreground))] transition-colors duration-500">Total</span>
                    <span className="font-bold text-lg text-primary transition-colors duration-500">
                      {formatPrice(calculateTotal())}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Fixed Footer */}
            <div className="border-t border-[hsl(var(--border))] px-5 py-4 pb-safe bg-[hsl(var(--sheet-bg))] flex-shrink-0 transition-colors duration-500">
              <button 
                onClick={handleReserveClick}
                disabled={reserving || !bag || bag.quantity_available <= 0}
                className="w-full rounded-2xl bg-primary py-4 text-center font-semibold text-primary-foreground shadow-lg touch-active transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {reserving && <Loader2 className="h-5 w-5 animate-spin" />}
                {!bag || bag.quantity_available <= 0 
                  ? "Sold Out" 
                  : reserving 
                    ? "Reserving..." 
                    : `Reserve for ${formatPrice(calculateTotal())}`}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
        onSuccess={handleAuthSuccess}
      />

      {/* Pickup Success Screen */}
      <PickupSuccessScreen
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        orderId={confirmedOrderId}
        shopName={shop.name}
      />
    </>
  );
}

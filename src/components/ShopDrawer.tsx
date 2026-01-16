import { useState } from "react";
import { Clock, MapPin, Heart, X, Loader2, Package, Sparkles } from "lucide-react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import confetti from "canvas-confetti";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthModal } from "./AuthModal";
import { OrderConfirmationModal } from "./OrderConfirmationModal";
import type { User } from "@supabase/supabase-js";

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
            className="fixed bottom-0 left-0 right-0 z-50 h-[85dvh] rounded-t-3xl bg-white shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            {/* Drag Handle - Large hit area */}
            <div className="w-full h-12 flex items-center justify-center cursor-grab active:cursor-grabbing flex-shrink-0 touch-none">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
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
                className="absolute top-4 left-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 backdrop-blur-sm shadow-lg touch-active transition-all duration-200 active:scale-95"
              >
                <Heart 
                  className={`h-5 w-5 transition-colors duration-200 ${
                    isFavorite 
                      ? 'fill-red-500 text-red-500' 
                      : 'text-gray-700'
                  }`} 
                />
              </button>
              
              {/* Close Button - Top Right */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 backdrop-blur-sm shadow-lg touch-active transition-all duration-200 active:scale-95"
              >
                <X className="h-5 w-5 text-gray-700" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-5 pt-5 pb-4 overscroll-contain">
              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {shop.name}
              </h1>

              {/* Status Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-700">
                  <Clock className="h-4 w-4" />
                  Open until 23:00
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600">
                  <MapPin className="h-4 w-4" />
                  350m away
                </span>
              </div>

              {/* Description */}
              {shop.description && (
                <p className="text-gray-600 leading-relaxed mb-6">
                  {shop.description}
                </p>
              )}

              {/* What's in the bag Section */}
              <div className="mb-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-3">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  What's in the bag?
                </h3>
                <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-4">
                  <p className="text-gray-600 text-sm">
                    A surprise selection of delicious items that would otherwise go to waste. 
                    Contents vary daily based on what's available!
                  </p>
                </div>
              </div>

              {/* Mystery Bag Card */}
              {bag && (
                <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                      <Package className="h-7 w-7 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900 text-lg">Mystery Bag</h4>
                        <div className="text-right">
                          <span className="text-sm text-gray-400 line-through block">
                            {formatPrice(bag.original_price)}
                          </span>
                          <span className="text-xl font-bold text-primary">
                            {formatPrice(bag.discounted_price)}
                          </span>
                        </div>
                      </div>
                      <p className={`text-sm mt-1 ${bag.quantity_available > 0 ? 'text-gray-500' : 'text-red-500 font-medium'}`}>
                        {bag.quantity_available > 0 
                          ? `${bag.quantity_available} bags left today` 
                          : 'Sold out for today'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Fixed Footer */}
            <div className="border-t border-gray-100 px-5 py-4 pb-safe bg-white flex-shrink-0">
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
                    : `Reserve for ${bag ? formatPrice(bag.discounted_price) : ''}`}
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

      {/* Order Confirmation Modal */}
      <OrderConfirmationModal
        open={confirmationOpen}
        onOpenChange={setConfirmationOpen}
        orderId={confirmedOrderId}
        shopName={shop.name}
      />
    </>
  );
}

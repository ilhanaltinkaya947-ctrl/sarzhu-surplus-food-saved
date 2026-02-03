import { useState } from "react";
import { Clock, MapPin, Heart, X, Package, Sparkles, Zap, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import confetti from "canvas-confetti";
import { useTier } from "@/contexts/TierContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBasket } from "@/contexts/BasketContext";
import { isShopCurrentlyOpen, BusinessHours } from "@/lib/shopUtils";
import type { User } from "@supabase/supabase-js";

interface Shop {
  id: string;
  name: string;
  lat: number;
  long: number;
  image_url: string | null;
  description: string | null;
  opening_time?: string | null;
  closing_time?: string | null;
  days_open?: string[] | null;
  business_hours?: BusinessHours | null;
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
  const { currentTier } = useTier();
  const { t } = useLanguage();
  const { addItem, items } = useBasket();

  const isLegend = currentTier.name === "Legend";

  if (!shop) return null;

  const shopIsOpen = isShopCurrentlyOpen(shop.business_hours, shop.opening_time, shop.closing_time, shop.days_open);

  const discount = bag
    ? Math.round((1 - bag.discounted_price / bag.original_price) * 100)
    : 0;

  const isInBasket = items.some(item => item.bag.id === bag?.id);
  const canAddToBasket = bag && bag.quantity_available > 0 && !isInBasket && shopIsOpen;

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

  const handleAddToBasket = () => {
    if (!bag || bag.quantity_available <= 0) return;
    
    addItem(shop, bag);
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 500) {
      handleClose();
    }
  };

  return (
    <>
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
            {/* Drag Handle - Fixed at top */}
            <div className="w-full h-10 flex items-center justify-center cursor-grab active:cursor-grabbing flex-shrink-0 touch-none">
              <div className="w-12 h-1.5 bg-[hsl(var(--sheet-muted))]/30 rounded-full" />
            </div>

            {/* Scrollable Content - Image + Details */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {/* Hero Image with rounded corners */}
              <div className="relative mx-4 rounded-2xl overflow-hidden shadow-lg">
                <div className="aspect-[16/10] w-full">
                  <img
                    src={shop.image_url || "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800"}
                    alt={shop.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                
                {discount > 0 && (
                  <span className="absolute bottom-4 left-4 rounded-lg bg-destructive px-3 py-1.5 text-sm font-bold text-white shadow-lg ring-2 ring-background">
                    -{discount}% {t("general.off")}
                  </span>
                )}
                
                <button 
                  onClick={handleFavoriteClick}
                  className="absolute top-3 left-3 flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--sheet-bg))]/95 backdrop-blur-sm shadow-lg touch-active transition-all duration-200 active:scale-95"
                >
                  <Heart 
                    className={`h-5 w-5 transition-colors duration-200 ${
                      isFavorite 
                        ? 'fill-red-500 text-red-500' 
                        : 'text-[hsl(var(--sheet-muted))]'
                    }`} 
                  />
                </button>
                
                <button
                  onClick={handleClose}
                  className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--sheet-bg))]/95 backdrop-blur-sm shadow-lg touch-active transition-all duration-200 active:scale-95"
                >
                  <X className="h-5 w-5 text-[hsl(var(--sheet-foreground))]" />
                </button>
              </div>

              {/* Content */}
              <div className="px-5 pt-5 pb-4">
              <h1 className="text-3xl font-bold text-[hsl(var(--sheet-foreground))] mb-3 transition-colors duration-500">
                {shop.name}
              </h1>

              <div className="flex flex-wrap items-center gap-2 mb-5">
                {shopIsOpen ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1.5 text-sm font-medium text-emerald-500 transition-colors duration-500">
                    <Clock className="h-4 w-4" />
                    {t("shop.openUntil")} {shop.closing_time || "23:00"}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors duration-500">
                    <Clock className="h-4 w-4" />
                    {shop.opening_time 
                      ? t("shop.opensAt").replace("{time}", shop.opening_time)
                      : t("shop.currentlyClosed")
                    }
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--muted))] px-3 py-1.5 text-sm font-medium text-[hsl(var(--sheet-muted))] transition-colors duration-500">
                  <MapPin className="h-4 w-4" />
                  350m {t("shop.away")}
                </span>
              </div>

              {shop.description && (
                <p className="text-[hsl(var(--sheet-muted))] leading-relaxed mb-6 transition-colors duration-500">
                  {shop.description}
                </p>
              )}

              <div className="mb-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-[hsl(var(--sheet-foreground))] mb-3 transition-colors duration-500">
                  <Sparkles className="h-5 w-5 text-primary transition-colors duration-500" />
                  {t("shop.whatsInBag")}
                </h3>
                <div className="rounded-2xl bg-[hsl(var(--info-box-bg))] border border-[hsl(var(--info-box-border))] p-4 transition-colors duration-500">
                  <p className="text-[hsl(var(--sheet-muted))] text-sm transition-colors duration-500">
                    {t("shop.bagDescription")}
                  </p>
                </div>
              </div>

              {bag && (
                <div className="rounded-2xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] p-5 transition-colors duration-500">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/15 transition-colors duration-500">
                      <Package className="h-7 w-7 text-primary transition-colors duration-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-[hsl(var(--sheet-foreground))] text-lg transition-colors duration-500">
                          {t("shop.mysteryBag")}
                        </h4>
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
                          ? `${bag.quantity_available} ${t("shop.bagsLeft")}` 
                          : t("shop.soldOutToday")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {bag && (
                <div className="rounded-2xl bg-[hsl(var(--muted))] border border-[hsl(var(--border))] p-4 space-y-3 transition-colors duration-500 mt-4">
                  <h4 className="font-semibold text-[hsl(var(--sheet-foreground))] text-sm transition-colors duration-500">
                    {t("shop.priceBreakdown")}
                  </h4>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-[hsl(var(--sheet-muted))] transition-colors duration-500">{t("shop.mysteryBag")}</span>
                    <span className="text-[hsl(var(--sheet-foreground))] font-medium transition-colors duration-500">
                      {formatPrice(bag.discounted_price)}
                    </span>
                  </div>

                  <div className="flex justify-between pt-3 border-t border-[hsl(var(--border))]">
                    <span className="font-semibold text-[hsl(var(--sheet-foreground))] transition-colors duration-500">{t("shop.price")}</span>
                    <span className="font-bold text-lg text-primary transition-colors duration-500">
                      {formatPrice(bag.discounted_price)}
                    </span>
                  </div>
                </div>
              )}
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="border-t border-[hsl(var(--border))] px-5 py-4 pb-safe bg-[hsl(var(--sheet-bg))] flex-shrink-0 transition-colors duration-500">
              <button 
                onClick={handleAddToBasket}
                disabled={!canAddToBasket}
                className="w-full rounded-2xl bg-primary py-4 text-center font-semibold text-primary-foreground shadow-lg touch-active transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingCart className="h-5 w-5" />
                {!bag || bag.quantity_available <= 0 
                  ? t("shop.soldOut")
                  : !shopIsOpen
                    ? t("shop.currentlyClosed")
                    : isInBasket
                      ? t("shop.inBasket")
                      : t("shop.addToBasket")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

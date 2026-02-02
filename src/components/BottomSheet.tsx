import { Utensils, Coffee, Cake, Salad, Crown, Lock, ShoppingBag } from "lucide-react";
import { motion, PanInfo, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useRef, useCallback, useMemo } from "react";
import { FoodCard, MarketingBanner } from "./FoodCard";
import { useProfile } from "@/hooks/useProfile";
import { useTier } from "@/contexts/TierContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

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

interface BottomSheetProps {
  onCategoryChange?: (category: string) => void;
  onShopClick?: (shop: Shop) => void;
  onReserve?: (bag: MysteryBag, shop: Shop) => void;
  isHidden?: boolean;
  shops?: Shop[];
  bags?: MysteryBag[];
  selectedBag?: MysteryBag | null;
  selectedShop?: Shop | null;
  onJoeClick?: () => void;
  showJoeBadge?: boolean;
}

// Height-based animation - button always visible
const COLLAPSED_HEIGHT = '270px';
const EXPANDED_HEIGHT = '85dvh';
const DRAG_THRESHOLD = 40;

const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

const SERVICE_FEE = 200;
const PACK_LEADER_DISCOUNT = 0.20;

export function BottomSheet({
  onCategoryChange,
  onShopClick,
  onReserve,
  isHidden = false,
  shops = [],
  bags = [],
  selectedBag = null,
  selectedShop = null,
  onJoeClick,
  showJoeBadge = false,
}: BottomSheetProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { profile } = useProfile();
  const { currentTier, nextTierProgress, ordersToNextTier, nextTierName, cycleTierForDebug, completedOrders } = useTier();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const clickCountRef = useRef(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const isChatUnlocked = completedOrders >= 5;

  const categories = [
    { id: "all", labelKey: "category.all", icon: Utensils },
    { id: "bakery", labelKey: "category.bakery", icon: Cake },
    { id: "coffee", labelKey: "category.coffee", icon: Coffee },
    { id: "healthy", labelKey: "category.healthy", icon: Salad },
  ];

  // Category keywords for filtering
  const categoryKeywords: Record<string, string[]> = {
    bakery: ["bakery", "bread", "pastry", "cake", "croissant", "bun", "наубайхана", "хлеб", "булочная"],
    coffee: ["coffee", "café", "cafe", "espresso", "latte", "кофе", "кофейня"],
    healthy: ["healthy", "salad", "vegan", "organic", "fresh", "здоровый", "салат", "фреш"],
  };

  // Filter shops based on category
  const filteredShops = useMemo(() => {
    if (activeCategory === "all") return shops;
    
    const keywords = categoryKeywords[activeCategory] || [];
    return shops.filter(shop => {
      const searchText = `${shop.name} ${shop.description || ""}`.toLowerCase();
      return keywords.some(keyword => searchText.includes(keyword.toLowerCase()));
    });
  }, [shops, activeCategory]);
  
  const handleMascotClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    clickCountRef.current += 1;
    
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    
    if (clickCountRef.current >= 3) {
      cycleTierForDebug();
      clickCountRef.current = 0;
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        if (clickCountRef.current < 3) {
          if (isChatUnlocked) {
            onJoeClick?.();
          } else {
            toast(t("bottomSheet.aiLocked"), {
              description: t("bottomSheet.ordersToUnlock").replace("{count}", String(5 - completedOrders)),
            });
          }
        }
        clickCountRef.current = 0;
      }, 400);
    }
  }, [cycleTierForDebug, onJoeClick, isChatUnlocked, completedOrders, t]);
  
  const isPackLeader = profile && profile.loyalty_points >= 20;

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    onCategoryChange?.(categoryId);
  };

  const closeSheet = () => {
    setIsOpen(false);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  };

  const openSheet = () => {
    setIsOpen(true);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y < -DRAG_THRESHOLD) {
      openSheet();
    }
    else if (info.offset.y > DRAG_THRESHOLD) {
      closeSheet();
    }
  };

  const toggleSheet = () => {
    setIsOpen(!isOpen);
  };

  const getBagForShop = (shopId: string) => {
    return bags.find((bag) => bag.shop_id === shopId);
  };

  const handleReserveClick = () => {
    if (selectedBag && selectedShop && onReserve) {
      onReserve(selectedBag, selectedShop);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-KZ", {
      style: "currency",
      currency: "KZT",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const calculateTotal = () => {
    if (!selectedBag) return 0;
    const basePrice = selectedBag.discounted_price;
    const fee = isPackLeader ? 0 : SERVICE_FEE;
    return basePrice + fee;
  };

  const buttonPrice = selectedBag 
    ? formatPrice(calculateTotal()) 
    : formatPrice(1200);

  const hasSelection = selectedBag && selectedShop;

  const getNextTierTarget = () => {
    if (currentTier.name === "FoodSaver") return 5;
    if (currentTier.name === "SmartPicker") return 20;
    return 20;
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && !isHidden && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={springTransition}
            className="fixed inset-0 z-40 bg-black/20"
            onClick={closeSheet}
          />
        )}
      </AnimatePresence>

      <motion.div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50",
          "bg-[hsl(var(--sheet-bg,var(--card)))] rounded-t-[32px] rounded-b-none",
          "shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.15)] transition-colors duration-500"
        )}
        style={{ touchAction: 'none' }}
        initial={false}
        animate={{ 
          height: isHidden ? 0 : (isOpen ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT),
          opacity: isHidden ? 0 : 1,
        }}
        transition={springTransition}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.05}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col h-full">
          <div 
            className="flex items-center justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
            onClick={toggleSheet}
          >
            <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
          </div>

          <div className="flex items-center justify-between w-full px-4 pb-3">
            <div className="flex-1 mr-4">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">
                {nextTierName 
                  ? `${t("bottomSheet.nextTier")}: ${nextTierName} (${completedOrders}/${getNextTierTarget()})`
                  : `${currentTier.name} - ${t("bottomSheet.maxTier")}`
                }
              </p>
              <div className="w-32 h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500 rounded-full"
                  style={{ width: `${nextTierProgress}%` }}
                />
              </div>
            </div>

            <motion.button
              onClick={handleMascotClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative h-12 w-12 rounded-full bg-primary shadow-lg flex items-center justify-center flex-shrink-0"
              style={{ 
                boxShadow: "0 4px 20px hsl(var(--primary) / 0.4)"
              }}
            >
              <motion.div
                className="absolute inset-0 rounded-full bg-primary"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              
              <img 
                src={currentTier.mascotImage} 
                alt={currentTier.name} 
                className={cn(
                  "relative z-10 h-10 w-10 rounded-full object-cover",
                  !isChatUnlocked && "opacity-60 grayscale"
                )}
              />

              {!isChatUnlocked && (
                <div 
                  className="absolute -bottom-1.5 -right-1.5 h-7 w-7 rounded-full bg-white flex items-center justify-center z-20"
                  style={{ 
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3), 0 0 0 2px white"
                  }}
                >
                  <Lock className="h-3.5 w-3.5 text-gray-700" strokeWidth={2.5} />
                </div>
              )}

              {showJoeBadge && isChatUnlocked && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-destructive border-2 border-background"
                />
              )}
            </motion.button>
          </div>

          <div className="flex-none px-4">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-3">
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = activeCategory === category.id;

                return (
                  <button
                    key={category.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCategoryClick(category.id);
                    }}
                    className={cn(
                      "flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium transition-all border",
                      isActive
                        ? "bg-primary text-primary-foreground border-transparent shadow-md"
                        : "bg-secondary text-muted-foreground border-transparent"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {t(category.labelKey)}
                  </button>
                );
              })}
            </div>
          </div>

          <motion.div
            ref={scrollRef}
            className={cn(
              "flex-1 min-h-0 px-4 overflow-hidden",
              isOpen && "overflow-y-auto overscroll-contain"
            )}
            animate={{ opacity: isOpen ? 1 : 0 }}
            transition={{ duration: 0.15 }}
            style={{ touchAction: isOpen ? "pan-y" : "none" }}
          >
            {isOpen && (
              <div className="pb-4">
                <div className="flex items-center justify-between mb-4 sticky top-0 bg-[hsl(var(--sheet-bg,var(--card)))] py-2 -mx-4 px-4 z-10 transition-colors duration-500">
                  <h3 className="text-lg font-bold text-[hsl(var(--sheet-foreground,var(--card-foreground)))]">
                    {t("bottomSheet.featuredDeals")}
                  </h3>
                  <button className="text-sm font-medium text-primary">{t("bottomSheet.seeAll")}</button>
                </div>

                <MarketingBanner className="mb-5" />

                <div className="grid grid-cols-2 gap-3">
                  {filteredShops.map((shop) => {
                    const bag = getBagForShop(shop.id);

                    return (
                      <FoodCard
                        key={shop.id}
                        id={shop.id}
                        name={shop.name}
                        imageUrl={shop.image_url}
                        description={shop.description}
                        originalPrice={bag?.original_price}
                        discountedPrice={bag?.discounted_price}
                        bagsLeft={bag?.quantity_available}
                        onClick={() => onShopClick?.(shop)}
                      />
                    );
                  })}
                </div>

                {filteredShops.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">{t("bottomSheet.noShops")}</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          <div 
            className="flex-none mt-auto px-4 pt-4 bg-[hsl(var(--sheet-bg,var(--card)))] border-t border-border transition-colors duration-500"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
          >
            {hasSelection && isPackLeader && (
              <div className="flex items-center justify-center gap-2 mb-3 py-2 px-4 bg-primary/10 border border-primary/30 rounded-xl">
                <Crown className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">{currentTier.name} VIP</span>
                <span className="text-xs text-muted-foreground line-through ml-2">
                  +{formatPrice(SERVICE_FEE)}
                </span>
              </div>
            )}

            {hasSelection ? (
              <button 
                onClick={handleReserveClick}
                onPointerDown={(e) => e.stopPropagation()}
                className="flex w-full h-14 items-center justify-center gap-2 rounded-xl font-semibold shadow-lg transition-all active:scale-[0.98] bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {t("bottomSheet.reserve")} {selectedShop?.name} • {buttonPrice}
              </button>
            ) : (
              <div className="flex gap-3">
                <button 
                  onClick={() => navigate("/orders")}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="flex h-14 items-center justify-center gap-2 rounded-xl font-semibold transition-all active:scale-[0.98] bg-secondary text-foreground px-5"
                >
                  <ShoppingBag className="h-5 w-5" />
                  {t("bottomSheet.myOrders")}
                </button>
                <div className="flex-1 h-14 flex items-center justify-center rounded-xl bg-muted text-muted-foreground font-medium">
                  {t("bottomSheet.selectShop")}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}

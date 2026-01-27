import { Utensils, Coffee, Cake, Salad, ShoppingBag, Crown } from "lucide-react";
import { motion, PanInfo, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";
import { FoodCard, MarketingBanner } from "./FoodCard";
import { useProfile } from "@/hooks/useProfile";

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

const categories = [
  { id: "all", label: "All", icon: Utensils },
  { id: "bakery", label: "Bakery", icon: Cake },
  { id: "coffee", label: "Coffee", icon: Coffee },
  { id: "healthy", label: "Healthy", icon: Salad },
  { id: "grocery", label: "Grocery", icon: ShoppingBag },
];

interface BottomSheetProps {
  onCategoryChange?: (category: string) => void;
  onShopClick?: (shop: Shop) => void;
  onReserve?: (bag: MysteryBag, shop: Shop) => void;
  isHidden?: boolean;
  shops?: Shop[];
  bags?: MysteryBag[];
  selectedBag?: MysteryBag | null;
  selectedShop?: Shop | null;
}

// Height constants - collapsed is just enough for handle + chips + button
const COLLAPSED_HEIGHT = 'auto';
const EXPANDED_HEIGHT_RATIO = 0.70; // 70dvh
const DRAG_THRESHOLD = 100;

// Spring physics for native feel
const springConfig = {
  type: "spring" as const,
  stiffness: 250,
  damping: 30,
};

// Service fee constant
const SERVICE_FEE = 200; // 200 KZT service fee
const PACK_LEADER_DISCOUNT = 0.20; // 20% off for Pack Leader

export function BottomSheet({
  onCategoryChange,
  onShopClick,
  onReserve,
  isHidden = false,
  shops = [],
  bags = [],
  selectedBag = null,
  selectedShop = null,
}: BottomSheetProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { profile } = useProfile();
  
  // Check if user is Pack Leader (20+ points)
  const isPackLeader = profile && profile.loyalty_points >= 20;

  // Calculate expanded height (70% of viewport)
  const getExpandedHeight = () => {
    if (typeof window !== "undefined") {
      return window.innerHeight * EXPANDED_HEIGHT_RATIO;
    }
    return 500;
  };

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    onCategoryChange?.(categoryId);
  };

  const collapseSheet = () => {
    setIsExpanded(false);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  };

  const expandSheet = () => {
    setIsExpanded(true);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;

    // Dragged UP or flicked UP fast -> Expand
    if (offset.y < -DRAG_THRESHOLD || velocity.y < -400) {
      expandSheet();
    }
    // Dragged DOWN or flicked DOWN fast -> Collapse
    else if (offset.y > DRAG_THRESHOLD || velocity.y > 400) {
      collapseSheet();
    }
    // Otherwise stay in current state
  };

  const toggleExpanded = () => {
    if (isExpanded) {
      collapseSheet();
    } else {
      expandSheet();
    }
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

  // Calculate total with potential Pack Leader discount
  const calculateTotal = () => {
    if (!selectedBag) return 0;
    const basePrice = selectedBag.discounted_price;
    const fee = isPackLeader ? 0 : SERVICE_FEE;
    return basePrice + fee;
  };

  // Get the price to display on the button
  const buttonPrice = selectedBag 
    ? formatPrice(calculateTotal()) 
    : formatPrice(1200);

  const hasSelection = selectedBag && selectedShop;

  return (
    <>
      {/* Blur Overlay - z-40 */}
      <AnimatePresence>
        {isExpanded && !isHidden && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={springConfig}
            className="fixed inset-0 z-40 backdrop-blur-[2px] bg-black/20"
            onClick={collapseSheet}
          />
        )}
      </AnimatePresence>

      {/* Single Expandable Card Container - Anchored to absolute bottom */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50"
        initial={false}
        animate={{
          y: isHidden ? "100%" : 0,
          opacity: isHidden ? 0 : 1,
        }}
        transition={springConfig}
      >
        <motion.div
          className={cn(
            "flex flex-col bg-white rounded-t-[32px] rounded-b-none",
            "shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)]",
            "overflow-hidden",
            !isExpanded && "justify-start"
          )}
          animate={{ height: isExpanded ? getExpandedHeight() : 'auto' }}
          transition={springConfig}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0.1, bottom: 0.1 }}
          onDragEnd={handleDragEnd}
        >
          {/* Header: Drag Handle + Title */}
          <div
            className="flex-shrink-0 cursor-grab active:cursor-grabbing"
            onClick={toggleExpanded}
          >
            {/* Drag Handle Pill */}
            <div className="flex items-center justify-center pt-3 pb-2">
              <div className="h-1 w-10 rounded-full bg-gray-300" />
            </div>

            {/* Category Chips - Always Visible */}
            <div className="px-4 pb-3">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
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
                        "flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium transition-all",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-gray-100 text-gray-700"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {category.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Body: Scrollable Food Grid - Only visible when expanded */}
          <motion.div
            ref={scrollRef}
            className={cn(
              "flex-1 min-h-0 px-4",
              isExpanded ? "overflow-y-auto overscroll-contain" : "overflow-hidden"
            )}
            animate={{ opacity: isExpanded ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ touchAction: isExpanded ? "pan-y" : "none" }}
          >
            {isExpanded && (
              <div className="pb-4">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-4 sticky top-0 bg-white py-2 -mx-4 px-4 z-10">
                  <h3 className="text-lg font-bold text-gray-900">Featured Deals</h3>
                  <button className="text-sm font-medium text-primary">See all</button>
                </div>

                {/* Marketing Banner */}
                <MarketingBanner className="mb-5" />

                {/* 2-Column Food Cards Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {shops.map((shop) => {
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

                {/* Empty State */}
                {shops.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No shops available nearby</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Footer: Reserve Button - Always visible */}
          <div 
            className="flex-shrink-0 px-4 pt-4 bg-white"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
          >
            {/* Pack Leader VIP Badge - Show above button when applicable */}
            {hasSelection && isPackLeader && (
              <div className="flex items-center justify-center gap-2 mb-3 py-2 px-4 bg-[#FFB800]/10 border border-[#FFB800]/30 rounded-xl">
                <Crown className="h-4 w-4 text-[#FFB800]" />
                <span className="text-sm font-semibold text-[#FFB800]">Joe's VIP Discount</span>
                <span className="text-xs text-muted-foreground line-through ml-2">
                  +{formatPrice(SERVICE_FEE)} fee
                </span>
              </div>
            )}

            <button 
              onClick={handleReserveClick}
              disabled={!hasSelection}
              className={cn(
                "flex w-full h-14 items-center justify-center gap-2 rounded-2xl font-semibold shadow-lg transition-all active:scale-[0.98]",
                hasSelection 
                  ? "bg-foreground text-white" 
                  : "bg-gray-200 text-gray-500"
              )}
            >
              {hasSelection 
                ? `Reserve ${selectedShop?.name} • ${buttonPrice}`
                : "Select a shop to reserve"
              }
            </button>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

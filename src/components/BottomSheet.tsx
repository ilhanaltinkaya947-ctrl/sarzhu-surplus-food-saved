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

// Height-based animation - button always visible
const COLLAPSED_HEIGHT = '230px'; // Handle + Chips + Button
const EXPANDED_HEIGHT = '85dvh';
const DRAG_THRESHOLD = 40;

// Snappy iOS-style spring physics
const springTransition = {
  type: "spring" as const,
  stiffness: 300,
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
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { profile } = useProfile();
  
  // Check if user is Pack Leader (20+ points)
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

  // Snap to state based on drag gesture
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Drag Up -> Open
    if (info.offset.y < -DRAG_THRESHOLD) {
      openSheet();
    }
    // Drag Down -> Close
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

      {/* Main Sheet - Height animates, drag for gesture detection only */}
      <motion.div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50",
          "bg-white rounded-t-[32px] rounded-b-none",
          "shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.15)]"
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
        {/* Full Height Flex Column */}
        <div className="flex flex-col h-full">
          {/* Section 1: Header - Handle + Chips */}
          <div className="flex-none pt-2 px-4">
            {/* Drag Handle */}
            <div 
              className="flex items-center justify-center py-3 cursor-grab active:cursor-grabbing"
              onClick={toggleSheet}
            >
              <div className="h-1 w-10 rounded-full bg-gray-300" />
            </div>

            {/* Category Chips */}
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
                    {category.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Body - Scrollable List */}
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

          {/* Section 3: Footer - Reserve Button (always visible, mt-auto pins to bottom) */}
          <div 
            className="flex-none mt-auto px-4 pt-4 bg-white border-t border-gray-50"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
          >
            {/* Pack Leader VIP Badge */}
            {hasSelection && isPackLeader && (
              <div className="flex items-center justify-center gap-2 mb-3 py-2 px-4 bg-primary/10 border border-primary/30 rounded-xl">
                <Crown className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Joe's VIP Discount</span>
                <span className="text-xs text-muted-foreground line-through ml-2">
                  +{formatPrice(SERVICE_FEE)} fee
                </span>
              </div>
            )}

            <button 
              onClick={handleReserveClick}
              onPointerDown={(e) => e.stopPropagation()}
              disabled={!hasSelection}
              className={cn(
                "flex w-full h-14 items-center justify-center gap-2 rounded-xl font-semibold shadow-lg transition-all active:scale-[0.98]",
                hasSelection 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "bg-gray-200 text-gray-500"
              )}
            >
              {hasSelection 
                ? `Reserve ${selectedShop?.name} • ${buttonPrice}`
                : "Select a shop to reserve"
              }
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

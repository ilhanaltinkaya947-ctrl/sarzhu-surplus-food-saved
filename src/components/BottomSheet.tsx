import { QrCode, Utensils, Coffee, Cake, Salad, ShoppingBag } from "lucide-react";
import { motion, PanInfo, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";
import { FoodCard, MarketingBanner } from "./FoodCard";

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
  isHidden?: boolean;
  shops?: Shop[];
  bags?: MysteryBag[];
}

// Height constants
const COLLAPSED_HEIGHT = 180;
const EXPANDED_HEIGHT_RATIO = 0.70; // 70dvh
const DRAG_THRESHOLD = 100;

// Spring physics for native feel
const springConfig = {
  type: "spring" as const,
  stiffness: 250,
  damping: 30,
};

export function BottomSheet({
  onCategoryChange,
  onShopClick,
  isHidden = false,
  shops = [],
  bags = [],
}: BottomSheetProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Calculate expanded height (70% of viewport)
  const getExpandedHeight = () => {
    if (typeof window !== "undefined") {
      return window.innerHeight * EXPANDED_HEIGHT_RATIO;
    }
    return 500;
  };

  const currentHeight = isExpanded ? getExpandedHeight() : COLLAPSED_HEIGHT;

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

      {/* Single Expandable Card Container */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 mx-2 mb-2"
        initial={false}
        animate={{
          y: isHidden ? "100%" : 0,
          opacity: isHidden ? 0 : 1,
        }}
        transition={springConfig}
      >
        <motion.div
          className={cn(
            "flex flex-col bg-white rounded-t-[32px]",
            "shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.2)]",
            "overflow-hidden"
          )}
          animate={{ height: currentHeight }}
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

          {/* Footer: Sticky Scan QR Button */}
          <div className="flex-shrink-0 px-4 pb-4 pt-2 bg-white">
            <button className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary py-3.5 text-primary-foreground font-semibold shadow-lg transition-transform active:scale-[0.98]">
              <QrCode className="h-5 w-5" />
              Scan QR to Reserve
            </button>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

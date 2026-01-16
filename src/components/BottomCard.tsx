import { QrCode, Utensils, Coffee, Cake, Salad, ShoppingBag } from "lucide-react";
import { motion, PanInfo, useAnimation, AnimatePresence } from "framer-motion";
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

interface BottomCardProps {
  onCategoryChange?: (category: string) => void;
  onShopClick?: (shop: Shop) => void;
  isHidden?: boolean;
  shops?: Shop[];
  bags?: MysteryBag[];
}

// Snap point heights - 70/30 split
const COLLAPSED_HEIGHT = 160;
const EXPANDED_RATIO = 0.70; // 70% of viewport
const DRAG_THRESHOLD = 80;

export function BottomCard({ 
  onCategoryChange, 
  onShopClick,
  isHidden = false, 
  shops = [], 
  bags = [] 
}: BottomCardProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [isExpanded, setIsExpanded] = useState(false);
  const controls = useAnimation();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Calculate expanded height dynamically (70% of viewport)
  const getExpandedHeight = () => {
    if (typeof window !== 'undefined') {
      return window.innerHeight * EXPANDED_RATIO;
    }
    return 500; // fallback
  };

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    onCategoryChange?.(categoryId);
  };

  const collapseSheet = () => {
    setIsExpanded(false);
    controls.start({ y: 0 });
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  };

  const expandSheet = () => {
    const expandedHeight = getExpandedHeight();
    setIsExpanded(true);
    controls.start({ y: -(expandedHeight - COLLAPSED_HEIGHT) });
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    const expandedHeight = getExpandedHeight();
    
    // Dragged UP or flicked UP fast -> Expand
    if (offset.y < -DRAG_THRESHOLD || velocity.y < -400) {
      setIsExpanded(true);
      controls.start({ y: -(expandedHeight - COLLAPSED_HEIGHT) });
    } 
    // Dragged DOWN or flicked DOWN fast -> Collapse
    else if (offset.y > DRAG_THRESHOLD || velocity.y > 400) {
      collapseSheet();
    }
    // Not enough movement -> Snap back to current state
    else {
      controls.start({ y: isExpanded ? -(expandedHeight - COLLAPSED_HEIGHT) : 0 });
    }
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

  const expandedHeight = getExpandedHeight();

  // Spring config for smooth, consistent animations
  const springConfig = {
    type: "spring" as const,
    damping: 30,
    stiffness: 250,
  };

  return (
    <>
      {/* Blur Overlay - sits behind sheet (z-40), on top of map (z-0) */}
      <AnimatePresence>
        {isExpanded && !isHidden && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={springConfig}
            className="fixed inset-0 z-40 backdrop-blur-[2px] bg-black/20"
            onClick={collapseSheet}
            style={{ pointerEvents: 'auto' }}
          />
        )}
      </AnimatePresence>

      {/* Unified Page Sheet Container */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
        initial={false}
        animate={{ 
          y: isHidden ? "100%" : 0,
          opacity: isHidden ? 0 : 1,
        }}
        transition={springConfig}
      >
        <motion.div 
          className={cn(
            "mx-2 mb-2 flex flex-col pointer-events-auto",
            "bg-white rounded-t-[32px]",
            "shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.2)]"
          )}
          style={{ 
            height: isExpanded ? expandedHeight : COLLAPSED_HEIGHT,
          }}
          drag="y"
          dragConstraints={{ top: -(expandedHeight - COLLAPSED_HEIGHT), bottom: 0 }}
          dragElastic={{ top: 0.05, bottom: 0.15 }}
          onDragEnd={handleDragEnd}
          animate={controls}
          transition={springConfig}
        >
          {/* Drag Handle - Inside the white container */}
          <div 
            className="w-full flex items-center justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing flex-shrink-0"
            onClick={toggleExpanded}
          >
            <div className="h-1 w-10 rounded-full bg-gray-300" />
          </div>
          
          {/* Scrollable Content Area */}
          <div 
            ref={scrollRef}
            className={cn(
              "flex-1 px-4 min-h-0",
              isExpanded 
                ? "overflow-y-auto overscroll-contain" 
                : "overflow-hidden"
            )}
            style={{
              touchAction: isExpanded ? 'pan-y' : 'none',
            }}
          >
            {!isExpanded ? (
              /* Collapsed State - Chips */
              <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const isActive = activeCategory === category.id;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
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
            ) : (
              /* Expanded State - Visual Feed */
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
          </div>
          
          {/* Bottom Action Button - Always visible, inside the white container */}
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

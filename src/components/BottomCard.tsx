import { QrCode, Utensils, Coffee, Cake, Salad, ShoppingBag } from "lucide-react";
import { motion, PanInfo, useAnimation } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";
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

// Snap point heights - increased for visual feed
const COLLAPSED_HEIGHT = 180;
const EXPANDED_HEIGHT = 520;
const DRAG_THRESHOLD = 100;

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

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    onCategoryChange?.(categoryId);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    
    // Dragged UP or flicked UP fast -> Expand
    if (offset.y < -DRAG_THRESHOLD || velocity.y < -500) {
      setIsExpanded(true);
      controls.start({ y: -(EXPANDED_HEIGHT - COLLAPSED_HEIGHT) });
    } 
    // Dragged DOWN or flicked DOWN fast -> Collapse
    else if (offset.y > DRAG_THRESHOLD || velocity.y > 500) {
      setIsExpanded(false);
      controls.start({ y: 0 });
    }
    // Not enough movement -> Snap back to current state
    else {
      controls.start({ y: isExpanded ? -(EXPANDED_HEIGHT - COLLAPSED_HEIGHT) : 0 });
    }
  };

  const toggleExpanded = () => {
    if (isExpanded) {
      setIsExpanded(false);
      controls.start({ y: 0 });
    } else {
      setIsExpanded(true);
      controls.start({ y: -(EXPANDED_HEIGHT - COLLAPSED_HEIGHT) });
    }
  };

  const getBagForShop = (shopId: string) => {
    return bags.find((bag) => bag.shop_id === shopId);
  };

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 z-40 pb-[env(safe-area-inset-bottom)]"
      initial={false}
      animate={{ 
        y: isHidden ? "100%" : 0,
        opacity: isHidden ? 0 : 1,
      }}
      transition={{ 
        type: "spring", 
        damping: 25, 
        stiffness: 300,
      }}
    >
      <motion.div 
        className="mx-3 mb-3 rounded-3xl bg-white shadow-[0_-4px_30px_-8px_rgba(0,0,0,0.25)] pointer-events-auto"
        style={{ 
          height: isExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT,
        }}
        drag="y"
        dragConstraints={{ top: -(EXPANDED_HEIGHT - COLLAPSED_HEIGHT), bottom: 0 }}
        dragElastic={{ top: 0.1, bottom: 0.1 }}
        onDragEnd={handleDragEnd}
        animate={controls}
        transition={{
          type: "spring",
          damping: 30,
          stiffness: 400,
        }}
      >
        <div className="flex flex-col h-full">
          {/* Pull Handle - Large touch area */}
          <div 
            className="w-full flex items-center justify-center p-4 cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
            onClick={toggleExpanded}
          >
            <div className="h-1.5 w-12 rounded-full bg-gray-300" />
          </div>
          
          {/* Content area */}
          <div className={cn(
            "flex-1 px-4 pb-4",
            isExpanded ? "overflow-y-auto overscroll-contain" : "overflow-hidden"
          )}>
            {!isExpanded ? (
              /* Collapsed State - Chips + Button */
              <>
                {/* Categories chips */}
                <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide -mx-4 px-4">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    const isActive = activeCategory === category.id;
                    
                    return (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryClick(category.id)}
                        className={cn(
                          "flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium transition-all touch-active",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-gray-100 text-gray-700"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {category.label}
                      </button>
                    );
                  })}
                </div>
                
                {/* Scan QR Button */}
                <button className="flex w-full items-center justify-center gap-3 rounded-2xl bg-primary py-4 text-primary-foreground font-semibold shadow-lg touch-active transition-transform active:scale-[0.98]">
                  <QrCode className="h-5 w-5" />
                  Scan QR to Reserve
                </button>
              </>
            ) : (
              /* Expanded State - Yandex Go Visual Feed */
              <>
                {/* Section Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Featured Deals</h3>
                  <button className="text-sm font-medium text-primary">See all</button>
                </div>
                
                {/* Marketing Banner - Full Width */}
                <MarketingBanner className="mb-4" />
                
                {/* 2-Column Food Cards Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {shops.slice(0, 6).map((shop) => {
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
                  <div className="text-center py-8">
                    <p className="text-gray-500">No shops available nearby</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

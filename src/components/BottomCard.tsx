import { QrCode, Utensils, Coffee, Cake, Salad, ShoppingBag, Pizza, IceCream, Sandwich, Apple } from "lucide-react";
import { motion, PanInfo, useAnimation } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";

const categories = [
  { id: "all", label: "All", icon: Utensils },
  { id: "bakery", label: "Bakery", icon: Cake },
  { id: "coffee", label: "Coffee", icon: Coffee },
  { id: "healthy", label: "Healthy", icon: Salad },
  { id: "grocery", label: "Grocery", icon: ShoppingBag },
];

// Expanded grid categories
const expandedCategories = [
  { id: "all", label: "All Food", icon: Utensils, color: "bg-emerald-500" },
  { id: "bakery", label: "Bakery", icon: Cake, color: "bg-amber-500" },
  { id: "coffee", label: "Coffee", icon: Coffee, color: "bg-amber-700" },
  { id: "healthy", label: "Healthy", icon: Salad, color: "bg-green-500" },
  { id: "grocery", label: "Grocery", icon: ShoppingBag, color: "bg-blue-500" },
  { id: "pizza", label: "Pizza", icon: Pizza, color: "bg-red-500" },
  { id: "dessert", label: "Desserts", icon: IceCream, color: "bg-pink-500" },
  { id: "sandwich", label: "Sandwiches", icon: Sandwich, color: "bg-orange-500" },
  { id: "fruits", label: "Fruits", icon: Apple, color: "bg-lime-500" },
];

interface BottomCardProps {
  onCategoryChange?: (category: string) => void;
  isHidden?: boolean;
}

// Snap point heights
const COLLAPSED_HEIGHT = 180;
const EXPANDED_HEIGHT = 450;
const DRAG_THRESHOLD = 100;

export function BottomCard({ onCategoryChange, isHidden = false }: BottomCardProps) {
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
              /* Expanded State - Category Grid */
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Browse Categories</h3>
                
                {/* Category Grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {expandedCategories.map((category) => {
                    const Icon = category.icon;
                    const isActive = activeCategory === category.id;
                    
                    return (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryClick(category.id)}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all touch-active",
                          isActive 
                            ? "bg-primary text-primary-foreground scale-95" 
                            : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                        )}
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center",
                          isActive ? "bg-white/20" : category.color
                        )}>
                          <Icon className={cn("h-6 w-6", isActive ? "" : "text-white")} />
                        </div>
                        <span className="text-xs font-medium">{category.label}</span>
                      </button>
                    );
                  })}
                </div>
                
                {/* Near you section */}
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Near You</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Cake className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">3 Bakeries</p>
                      <p className="text-sm text-gray-500">within 500m</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Coffee className="h-6 w-6 text-amber-700" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">5 Coffee Shops</p>
                      <p className="text-sm text-gray-500">within 1km</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

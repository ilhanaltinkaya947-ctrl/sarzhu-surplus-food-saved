import { QrCode, Utensils, Coffee, Cake, Salad, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";

const categories = [
  { id: "all", label: "All", icon: Utensils },
  { id: "bakery", label: "Bakery", icon: Cake },
  { id: "coffee", label: "Coffee", icon: Coffee },
  { id: "healthy", label: "Healthy", icon: Salad },
  { id: "grocery", label: "Grocery", icon: ShoppingBag },
];

interface BottomCardProps {
  onCategoryChange?: (category: string) => void;
  isHidden?: boolean;
}

export function BottomCard({ onCategoryChange, isHidden = false }: BottomCardProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    onCategoryChange?.(categoryId);
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
        mass: 0.8,
      }}
    >
      <div className="mx-3 mb-3 rounded-3xl bg-white shadow-[0_-4px_30px_-8px_rgba(0,0,0,0.2)]">
        <div className="p-4 pt-3">
          {/* Handle bar */}
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-200" />
          
          {/* Categories */}
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
        </div>
      </div>
    </motion.div>
  );
}

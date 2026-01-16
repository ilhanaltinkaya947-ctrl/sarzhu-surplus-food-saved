import { QrCode, Utensils, Coffee, Cake, Salad, ShoppingBag } from "lucide-react";
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
}

export function BottomCard({ onCategoryChange }: BottomCardProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    onCategoryChange?.(categoryId);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] pb-[env(safe-area-inset-bottom)] mb-4">
      <div className="rounded-t-3xl bg-white shadow-[0_-8px_40px_-12px_rgba(0,0,0,0.25)]">
        <div className="p-4 pt-5">
          {/* Handle bar */}
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted" />
          
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
                      : "bg-secondary text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {category.label}
                </button>
              );
            })}
          </div>
          
          {/* Scan QR Button */}
          <button className="mt-2 flex w-full items-center justify-center gap-3 rounded-2xl bg-primary py-4 text-primary-foreground font-semibold shadow-lg touch-active transition-transform active:scale-[0.98]">
            <QrCode className="h-5 w-5" />
            Scan QR to Reserve
          </button>
        </div>
      </div>
    </div>
  );
}

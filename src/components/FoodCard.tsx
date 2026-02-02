import { Star, Percent } from "lucide-react";
import { cn } from "@/lib/utils";

interface FoodCardProps {
  id: string;
  name: string;
  imageUrl: string | null;
  description: string | null;
  originalPrice?: number;
  discountedPrice?: number;
  bagsLeft?: number;
  rating?: number;
  onClick?: () => void;
  className?: string;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-KZ", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(price);
};

// Category detection for subtitle
const detectCategory = (name: string, description: string | null): string => {
  const text = `${name} ${description || ''}`.toLowerCase();
  if (text.includes('bakery') || text.includes('bread') || text.includes('pastry')) return 'Bakery';
  if (text.includes('coffee') || text.includes('café') || text.includes('cafe')) return 'Coffee Shop';
  if (text.includes('doner') || text.includes('kebab') || text.includes('turkish')) return 'Turkish';
  if (text.includes('pizza')) return 'Italian';
  if (text.includes('sushi') || text.includes('japanese')) return 'Japanese';
  return 'Restaurant';
};

export function FoodCard({
  id,
  name,
  imageUrl,
  description,
  originalPrice,
  discountedPrice,
  bagsLeft,
  rating = 4.5 + Math.random() * 0.5,
  onClick,
  className,
}: FoodCardProps) {
  const discount = originalPrice && discountedPrice
    ? Math.round((1 - discountedPrice / originalPrice) * 100)
    : 0;
  
  const category = detectCategory(name, description);
  const placeholderImage = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-2xl bg-card overflow-hidden shadow-sm border border-border transition-all active:scale-[0.98] touch-active",
        className
      )}
    >
      {/* Image Container - 4:3 aspect ratio */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <img
          src={imageUrl || placeholderImage}
          alt={name}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = placeholderImage;
          }}
        />
        
        {/* Discount Badge - High contrast themed */}
        {discount > 0 && (
          <div className={cn(
            "absolute top-3 left-3 z-10",
            "flex items-center gap-1 rounded-lg px-2 py-1",
            "bg-primary text-primary-foreground",
            "shadow-xl ring-2 ring-background"
          )}>
            <Percent className="h-3.5 w-3.5" />
            <span className="text-xs font-bold">-{discount}%</span>
          </div>
        )}
        
        {/* Bags Left Badge - High contrast themed */}
        {bagsLeft !== undefined && bagsLeft > 0 && bagsLeft <= 3 && (
          <div className={cn(
            "absolute top-3 right-3 z-10",
            "rounded-lg px-2 py-1",
            "bg-destructive text-destructive-foreground",
            "shadow-xl ring-2 ring-background"
          )}>
            <span className="text-xs font-bold">{bagsLeft} left!</span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-3">
        {/* Title */}
        <h3 className="font-semibold text-card-foreground text-base line-clamp-1 mb-1">
          {name}
        </h3>
        
        {/* Subtitle Row */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {category} • Pickup
          </span>
          
          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-sm font-medium text-card-foreground">
              {rating.toFixed(1)}
            </span>
          </div>
        </div>
        
        {/* Price Row */}
        {discountedPrice && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-base font-bold text-primary">
              {formatPrice(discountedPrice)}
            </span>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

// Marketing Banner Component
export function MarketingBanner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-5 shadow-lg",
        className
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <circle cx="80" cy="20" r="40" fill="white" />
          <circle cx="20" cy="80" r="30" fill="white" />
        </svg>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-lg">🌱</span>
          </div>
          <span className="text-sm font-medium text-white/80">Eco Initiative</span>
        </div>
        
        <h2 className="text-xl font-bold text-white mb-1">
          Save Food, Save Money
        </h2>
        <p className="text-white/90 text-sm mb-3">
          Rescue delicious meals at up to 50% off
        </p>
        
        <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2">
          <span className="text-sm font-semibold text-emerald-600">Explore Deals</span>
          <span className="text-emerald-600">→</span>
        </div>
      </div>
    </div>
  );
}

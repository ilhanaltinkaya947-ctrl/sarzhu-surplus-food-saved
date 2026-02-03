import { Star, Percent, ArrowRight, Award, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
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
  isClosed?: boolean;
  opensAt?: string | null;
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
  isClosed = false,
  opensAt,
}: FoodCardProps) {
  const { t } = useLanguage();
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
        isClosed && "opacity-60",
        className
      )}
    >
      {/* Image Container - 4:3 aspect ratio */}
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <img
          src={imageUrl || placeholderImage}
          alt={name}
          className={cn(
            "h-full w-full object-cover",
            isClosed && "grayscale"
          )}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = placeholderImage;
          }}
        />
        
        {/* Closed Badge */}
        {isClosed && (
          <div className={cn(
            "absolute top-3 left-3 z-10",
            "flex items-center gap-1 rounded-lg px-2 py-1",
            "bg-muted text-muted-foreground",
            "shadow-xl ring-2 ring-background"
          )}>
            <Clock className="h-3.5 w-3.5" />
            <span className="text-xs font-bold">
              {opensAt ? t("shop.opensAt").replace("{time}", opensAt) : t("shop.currentlyClosed")}
            </span>
          </div>
        )}
        
        {/* Discount Badge - High contrast themed */}
        {discount > 0 && !isClosed && (
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
        {bagsLeft !== undefined && bagsLeft > 0 && bagsLeft <= 3 && !isClosed && (
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

// Featured Shop Banner Component - "Place of the Month"
interface FeaturedShopBannerProps {
  className?: string;
  shop?: {
    id: string;
    name: string;
    image_url: string | null;
    description: string | null;
  };
  onExplore?: () => void;
}

export function FeaturedShopBanner({ className, shop, onExplore }: FeaturedShopBannerProps) {
  const { t } = useLanguage();
  const placeholderImage = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600";

  if (!shop) return null;

  return (
    <div
      className={cn(
        "relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-primary via-primary to-amber-500 shadow-lg",
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
      
      <div className="relative z-10 p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <Award className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-sm font-bold text-primary-foreground uppercase tracking-wide">
            {t("featured.placeOfMonth")}
          </span>
        </div>
        
        {/* Shop Card */}
        <div className="flex gap-3 items-center">
          <img
            src={shop.image_url || placeholderImage}
            alt={shop.name}
            className="w-20 h-20 rounded-xl object-cover ring-2 ring-primary-foreground/30"
            onError={(e) => {
              (e.target as HTMLImageElement).src = placeholderImage;
            }}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-primary-foreground text-lg line-clamp-1">
              {shop.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <Star className="h-4 w-4 fill-primary-foreground text-primary-foreground" />
              <span className="text-sm font-medium text-primary-foreground/90">
                {t("featured.topRated")}
              </span>
            </div>
          </div>
        </div>
        
        {/* Explore Button */}
        <button
          onClick={onExplore}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-primary-foreground text-primary rounded-xl px-4 py-3 font-semibold transition-all active:scale-[0.98]"
        >
          {t("featured.exploreShop")}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

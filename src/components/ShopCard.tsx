import { Star, Clock, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface Shop {
  id: string;
  name: string;
  image_url: string | null;
  description: string | null;
}

interface MysteryBag {
  id: string;
  quantity_available: number;
  original_price: number;
  discounted_price: number;
}

interface ShopCardProps {
  shop: Shop;
  bag?: MysteryBag;
  isFollowed?: boolean;
  compact?: boolean;
}

export function ShopCard({ shop, bag, isFollowed = false, compact = false }: ShopCardProps) {
  const discount = bag
    ? Math.round((1 - bag.discounted_price / bag.original_price) * 100)
    : 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-KZ", {
      style: "currency",
      currency: "KZT",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div
      className={cn(
        "bg-card rounded-2xl overflow-hidden shadow-card transition-all duration-500 ease-in-out touch-active",
        compact ? "w-[260px]" : "w-full"
      )}
    >
      {/* Image */}
      <div className="relative">
        <img
          src={shop.image_url || "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400"}
          alt={shop.name}
          className={cn(
            "w-full object-cover",
            compact ? "h-28" : "h-36"
          )}
        />
        
        {/* Discount Badge - Uses theme colors */}
        {bag && discount > 0 && (
          <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-lg transition-colors duration-500">
            -{discount}%
          </div>
        )}
        
        {/* Followed Badge */}
        {isFollowed && (
          <div className="absolute top-2 right-2 bg-accent text-accent-foreground p-1.5 rounded-full transition-colors duration-500">
            <Star className="h-3.5 w-3.5 fill-current" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className={cn("p-3", compact && "p-2.5")}>
        <h3 className={cn(
          "font-semibold text-foreground truncate",
          compact ? "text-sm" : "text-base"
        )}>
          {shop.name}
        </h3>
        
        {!compact && shop.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {shop.description}
          </p>
        )}

        {bag && (
          <div className="mt-2 flex items-center justify-between">
            {/* Quantity Badge - Uses theme colors */}
            <div className="flex items-center gap-1.5">
              <span className="bg-primary/15 text-primary px-2 py-0.5 rounded-md text-xs font-semibold transition-colors duration-500">
                <Package className="h-3 w-3 inline mr-1" />
                {bag.quantity_available} left
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(bag.original_price)}
              </span>
              {/* Price Badge - Uses theme colors */}
              <span className={cn(
                "font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-md transition-colors duration-500",
                compact ? "text-sm" : "text-base"
              )}>
                {formatPrice(bag.discounted_price)}
              </span>
            </div>
          </div>
        )}

        {bag && !compact && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>Pick up: 18:00 - 20:00</span>
          </div>
        )}
      </div>
    </div>
  );
}

import { Clock, MapPin, Heart, X } from "lucide-react";
import confetti from "canvas-confetti";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";

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

interface ShopDrawerProps {
  shop: Shop | null;
  bag: MysteryBag | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isFavorite: boolean;
  onToggleFavorite: (shopId: string) => void;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-KZ", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(price);
};

export function ShopDrawer({ 
  shop, 
  bag, 
  open, 
  onOpenChange, 
  isFavorite, 
  onToggleFavorite 
}: ShopDrawerProps) {
  if (!shop) return null;

  const discount = bag
    ? Math.round((1 - bag.discounted_price / bag.original_price) * 100)
    : 0;

  const handleFavoriteClick = () => {
    // Trigger confetti if adding to favorites
    if (!isFavorite) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { x: 0.15, y: 0.3 },
        colors: ['#F59E0B', '#EF4444', '#EC4899', '#8B5CF6'],
        ticks: 150,
        gravity: 1.2,
        scalar: 0.9,
      });
    }
    onToggleFavorite(shop.id);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[50vh] rounded-t-3xl focus:outline-none">
        {/* Header Image */}
        <div className="relative h-40 w-full overflow-hidden rounded-t-3xl">
          <img
            src={shop.image_url || "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800"}
            alt={shop.name}
            className="h-full w-full object-cover"
          />
          
          {/* Discount Badge */}
          {discount > 0 && (
            <span className="absolute top-4 left-16 rounded-lg bg-destructive px-3 py-1 text-sm font-bold text-destructive-foreground">
              -{discount}%
            </span>
          )}
          
          {/* Favorite Button - Top Left */}
          <button 
            onClick={handleFavoriteClick}
            className="absolute top-4 left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-md touch-active transition-all duration-200 active:scale-95"
          >
            <Heart 
              className={`h-5 w-5 transition-colors duration-200 ${
                isFavorite 
                  ? 'fill-red-500 text-red-500' 
                  : 'text-foreground'
              }`} 
            />
          </button>
          
          {/* Close Button - Top Right */}
          <DrawerClose className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-md touch-active transition-all duration-200 active:scale-95">
            <X className="h-5 w-5 text-foreground" />
          </DrawerClose>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6">
          <DrawerHeader className="p-0 mb-4">
            <DrawerTitle className="text-xl font-bold text-foreground text-left">
              {shop.name}
            </DrawerTitle>
          </DrawerHeader>

          {/* Info Row */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>Pick up: 6PM - 8PM</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              <span>350m away</span>
            </div>
          </div>

          {/* Description */}
          {shop.description && (
            <p className="text-sm text-muted-foreground mb-6">
              {shop.description}
            </p>
          )}

          {/* Mystery Bag Card */}
          {bag && (
            <div className="rounded-2xl bg-secondary p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-foreground">Mystery Bag</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {bag.quantity_available} left
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(bag.original_price)}
                  </span>
                  <span className="ml-2 text-lg font-bold text-primary">
                    {formatPrice(bag.discounted_price)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fixed Reserve Button */}
        <div className="border-t border-border px-5 py-4 pb-safe">
          <button className="w-full rounded-2xl bg-primary py-4 text-center font-semibold text-primary-foreground shadow-lg touch-active transition-transform active:scale-[0.98]">
            Reserve Now
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

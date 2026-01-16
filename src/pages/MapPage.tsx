import { useEffect, useState, useCallback } from "react";
import { MapView } from "@/components/MapView";
import { FloatingSearchBar } from "@/components/FloatingSearchBar";
import { BottomCard } from "@/components/BottomCard";
import { ShopDrawer } from "@/components/ShopDrawer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

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

export default function MapPage() {
  const { user } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [bags, setBags] = useState<MysteryBag[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [followedShopIds, setFollowedShopIds] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [shopsRes, bagsRes] = await Promise.all([
          supabase.from("shops").select("*"),
          supabase.from("mystery_bags").select("*"),
        ]);

        if (shopsRes.data) setShops(shopsRes.data);
        if (bagsRes.data) setBags(bagsRes.data);

        // Try to fetch user follows if logged in
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: follows } = await supabase
            .from("user_follows")
            .select("shop_id")
            .eq("user_id", user.id);
          
          if (follows) {
            setFollowedShopIds(follows.map(f => f.shop_id));
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleShopClick = (shop: Shop) => {
    setSelectedShop(shop);
    setDrawerOpen(true);
  };

  const handleToggleFavorite = useCallback(async (shopId: string) => {
    const isFavorite = followedShopIds.includes(shopId);
    
    // Optimistic update - update UI immediately
    if (isFavorite) {
      setFollowedShopIds(prev => prev.filter(id => id !== shopId));
    } else {
      setFollowedShopIds(prev => [...prev, shopId]);
    }

    // Try to persist to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // User not logged in - show toast but keep local state
        toast.info("Sign in to save your favorites permanently");
        return;
      }

      if (isFavorite) {
        // Remove from favorites
        await supabase
          .from("user_follows")
          .delete()
          .eq("user_id", user.id)
          .eq("shop_id", shopId);
        toast.success("Removed from favorites");
      } else {
        // Add to favorites
        await supabase
          .from("user_follows")
          .insert({ user_id: user.id, shop_id: shopId });
        toast.success("Added to favorites! ⭐");
      }
    } catch (error) {
      console.error("Error updating favorite:", error);
      // Revert optimistic update on error
      if (isFavorite) {
        setFollowedShopIds(prev => [...prev, shopId]);
      } else {
        setFollowedShopIds(prev => prev.filter(id => id !== shopId));
      }
      toast.error("Failed to update favorite");
    }
  }, [followedShopIds]);

  const getSelectedBag = () => {
    if (!selectedShop) return null;
    return bags.find((bag) => bag.shop_id === selectedShop.id) || null;
  };

  const isSelectedShopFavorite = selectedShop 
    ? followedShopIds.includes(selectedShop.id) 
    : false;

  const handleReservationComplete = useCallback(async () => {
    // Refresh bags data after reservation
    const { data: bagsData } = await supabase.from("mystery_bags").select("*");
    if (bagsData) setBags(bagsData);
  }, []);

  // Handle drawer close to deselect shop
  const handleDrawerChange = (open: boolean) => {
    setDrawerOpen(open);
    if (!open) {
      // Clear selection when drawer closes
      setTimeout(() => setSelectedShop(null), 300);
    }
  };

  return (
    <div className="relative h-[100dvh] w-screen overflow-hidden pointer-events-none">
      {/* Fullscreen Map - Background Layer z-0 */}
      {loading ? (
        <div className="flex h-full w-full items-center justify-center bg-muted pointer-events-auto">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading shops...</p>
          </div>
        </div>
      ) : (
        <div className={drawerOpen ? "pointer-events-none" : "pointer-events-auto"}>
          <MapView 
            shops={shops} 
            bags={bags} 
            followedShopIds={followedShopIds}
            selectedShopId={selectedShop?.id}
            onShopClick={handleShopClick}
          />
        </div>
      )}

      {/* Floating Search Bar - z-20 */}
      <div className="pointer-events-auto">
        <FloatingSearchBar />
      </div>

      {/* Bottom Card with Categories - z-40, hides when drawer opens */}
      <div className="pointer-events-auto">
        <BottomCard 
          isHidden={drawerOpen} 
          shops={shops}
          bags={bags}
          onShopClick={handleShopClick}
        />
      </div>

      {/* Shop Detail Drawer - z-50 */}
      <div className="pointer-events-auto">
        <ShopDrawer
          shop={selectedShop}
          bag={getSelectedBag()}
          open={drawerOpen}
          onOpenChange={handleDrawerChange}
          isFavorite={isSelectedShopFavorite}
          onToggleFavorite={handleToggleFavorite}
          user={user}
          onReservationComplete={handleReservationComplete}
        />
      </div>
    </div>
  );
}

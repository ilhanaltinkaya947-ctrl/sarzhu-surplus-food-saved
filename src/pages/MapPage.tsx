import { useEffect, useState } from "react";
import { MapView } from "@/components/MapView";
import { FloatingSearchBar } from "@/components/FloatingSearchBar";
import { BottomCard } from "@/components/BottomCard";
import { ShopDrawer } from "@/components/ShopDrawer";
import { supabase } from "@/integrations/supabase/client";

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
  const [shops, setShops] = useState<Shop[]>([]);
  const [bags, setBags] = useState<MysteryBag[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [shopsRes, bagsRes] = await Promise.all([
          supabase.from("shops").select("*"),
          supabase.from("mystery_bags").select("*"),
        ]);

        if (shopsRes.data) setShops(shopsRes.data);
        if (bagsRes.data) setBags(bagsRes.data);
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

  const getSelectedBag = () => {
    if (!selectedShop) return null;
    return bags.find((bag) => bag.shop_id === selectedShop.id) || null;
  };

  return (
    <div className="relative h-[100dvh] w-screen overflow-hidden pointer-events-none">
      {/* Fullscreen Map - Background Layer */}
      {loading ? (
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading shops...</p>
          </div>
        </div>
      ) : (
        <div className="pointer-events-auto">
          <MapView 
            shops={shops} 
            bags={bags} 
            onShopClick={handleShopClick}
          />
        </div>
      )}

      {/* Floating Search Bar */}
      <div className="pointer-events-auto">
        <FloatingSearchBar />
      </div>

      {/* Bottom Card with Categories */}
      <div className="pointer-events-auto">
        <BottomCard />
      </div>

      {/* Shop Detail Drawer */}
      <ShopDrawer
        shop={selectedShop}
        bag={getSelectedBag()}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  );
}

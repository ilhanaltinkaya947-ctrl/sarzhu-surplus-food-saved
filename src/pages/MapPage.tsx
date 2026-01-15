import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { MapView } from "@/components/MapView";
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

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <Header title="Sarzhu" showSearch transparent />
      
      {loading ? (
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading shops...</p>
          </div>
        </div>
      ) : (
        <MapView shops={shops} bags={bags} />
      )}
      
      {/* Bottom fade for nav */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background/60 to-transparent" />
    </div>
  );
}

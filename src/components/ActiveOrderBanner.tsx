import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin, ChevronRight, Navigation } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";

interface ActiveOrder {
  id: string;
  status: string;
  created_at: string;
  shop_name: string;
  shop_image: string | null;
  shop_lat: number;
  shop_long: number;
  shop_address: string | null;
}

interface ActiveOrderBannerProps {
  onNavigateToOrders?: () => void;
}

export function ActiveOrderBanner({ onNavigateToOrders }: ActiveOrderBannerProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setActiveOrder(null);
      setLoading(false);
      return;
    }

    const fetchActiveOrder = async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select(`
            id,
            status,
            created_at,
            mystery_bags!inner(
              shop_id,
              shops!inner(
                name,
                image_url,
                lat,
                long,
                address
              )
            )
          `)
          .eq("user_id", user.id)
          .in("status", ["pending", "reserved"])
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== "PGRST116") throw error;

        if (data) {
          setActiveOrder({
            id: data.id,
            status: data.status,
            created_at: data.created_at,
            shop_name: (data as any).mystery_bags?.shops?.name || "Unknown",
            shop_image: (data as any).mystery_bags?.shops?.image_url,
            shop_lat: (data as any).mystery_bags?.shops?.lat,
            shop_long: (data as any).mystery_bags?.shops?.long,
            shop_address: (data as any).mystery_bags?.shops?.address,
          });
        } else {
          setActiveOrder(null);
        }
      } catch (error) {
        console.error("Error fetching active order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveOrder();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('active-order-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchActiveOrder()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const open2GISRoute = () => {
    if (!activeOrder) return;
    const url = `https://2gis.kz/almaty/directions/points/${activeOrder.shop_long}%2C${activeOrder.shop_lat}?m=${activeOrder.shop_long}%2C${activeOrder.shop_lat}%2F16`;
    window.open(url, '_blank');
  };

  const shortOrderId = activeOrder?.id.slice(0, 8).toUpperCase();

  if (loading || !activeOrder) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="absolute top-20 left-4 right-4 z-30"
      >
        <div className="bg-card/95 backdrop-blur-md rounded-2xl shadow-elevated border border-border overflow-hidden">
          <button
            onClick={onNavigateToOrders}
            className="w-full p-3 flex items-center gap-3 text-left"
          >
            <div className="relative">
              <img
                src={activeOrder.shop_image || "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=100"}
                alt={activeOrder.shop_name}
                className="h-12 w-12 rounded-xl object-cover"
              />
              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-500 flex items-center justify-center">
                <Clock className="h-2.5 w-2.5 text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-amber-500 uppercase tracking-wide">
                  {t("orders.active")}
                </span>
                <span className="text-xs text-muted-foreground">#{shortOrderId}</span>
              </div>
              <p className="font-semibold text-foreground truncate">{activeOrder.shop_name}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                {activeOrder.shop_address || "Pickup available"}
              </p>
            </div>

            <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          </button>

          {/* Route Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              open2GISRoute();
            }}
            className="w-full py-2.5 px-3 bg-primary/10 border-t border-border flex items-center justify-center gap-2 text-primary font-medium text-sm hover:bg-primary/20 transition-colors"
          >
            <Navigation className="h-4 w-4" />
            {t("orders.openRoute")}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

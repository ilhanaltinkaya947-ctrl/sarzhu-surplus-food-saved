import { useState, useEffect, useCallback, useMemo } from "react";
import { Clock, CheckCircle2, Package, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Shop } from "@/contexts/MarketplaceContext";
import { SwipeButton } from "./SwipeButton";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Order {
  id: string;
  order_number: string | null;
  status: string;
  created_at: string;
  user_id: string;
  bag_id: string;
}

interface OrdersTabProps {
  shop: Shop;
  allShops?: Shop[];
}

export function OrdersTab({ shop, allShops }: OrdersTabProps) {
  const { t } = useLanguage();
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState<string>("all");

  // Get all bag IDs from all shops or just current shop
  const getAllBagIds = useCallback(() => {
    const shops = allShops && allShops.length > 0 ? allShops : [shop];
    return shops.flatMap(s => s.inventory.map(p => p.id));
  }, [shop, allShops]);

  // Filter orders by location
  const filteredActiveOrders = useMemo(() => {
    if (locationFilter === "all" || !allShops || allShops.length <= 1) {
      return activeOrders;
    }
    const selectedShop = allShops.find(s => s.id === locationFilter);
    if (!selectedShop) return activeOrders;
    const shopBagIds = selectedShop.inventory.map(p => p.id);
    return activeOrders.filter(o => shopBagIds.includes(o.bag_id));
  }, [activeOrders, locationFilter, allShops]);

  const filteredCompletedOrders = useMemo(() => {
    if (locationFilter === "all" || !allShops || allShops.length <= 1) {
      return completedOrders;
    }
    const selectedShop = allShops.find(s => s.id === locationFilter);
    if (!selectedShop) return completedOrders;
    const shopBagIds = selectedShop.inventory.map(p => p.id);
    return completedOrders.filter(o => shopBagIds.includes(o.bag_id));
  }, [completedOrders, locationFilter, allShops]);

  const fetchOrders = useCallback(async () => {
    const bagIds = getAllBagIds();
    if (bagIds.length === 0) {
      setLoading(false);
      return;
    }

    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .in("bag_id", bagIds)
        .gte("created_at", todayStart.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;

      const orders = data || [];
      setActiveOrders(orders.filter((o) => o.status === "reserved" || o.status === "purchased"));
      setCompletedOrders(orders.filter((o) => o.status === "picked_up" || o.status === "completed"));
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [getAllBagIds]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Real-time subscription
  useEffect(() => {
    const bagIds = getAllBagIds();
    if (bagIds.length === 0) return;
    
    const channel = supabase
      .channel("merchant-orders-tab")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          const order = payload.new as Order;
          if (bagIds.includes(order.bag_id)) {
            fetchOrders();
            
            if (payload.eventType === "INSERT") {
              toast.success(t("merchant.newOrder"));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [getAllBagIds, fetchOrders, t]);

  const handleCompleteOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "picked_up" })
        .eq("id", orderId);

      if (error) throw error;

      // Move from active to completed locally for instant feedback
      setActiveOrders((prev) => prev.filter((o) => o.id !== orderId));
      const completedOrder = activeOrders.find((o) => o.id === orderId);
      if (completedOrder) {
        setCompletedOrders((prev) => [{ ...completedOrder, status: "picked_up" }, ...prev]);
      }

      toast.success(t("merchant.orderCompleted"));
    } catch (error) {
      console.error("Error completing order:", error);
      toast.error(t("merchant.completeFailed"));
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatOrderNumber = (order: Order) => {
    return order.order_number || `#${order.id.slice(0, 8).toUpperCase()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Location Filter (only if multiple locations) */}
      {allShops && allShops.length > 1 && (
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t("merchant.allLocations")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("merchant.allLocations")}</SelectItem>
              {allShops.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Active Orders */}
      <div>
        <h2 className="text-lg font-bold mb-4">
          {t("merchant.activeOrders")} ({filteredActiveOrders.length})
        </h2>

        {filteredActiveOrders.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">{t("merchant.noActiveOrders")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredActiveOrders.map((order) => (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  className="p-4 rounded-2xl border-2 border-border bg-card"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-bold">{formatOrderNumber(order)}</p>
                        <p className="text-sm text-muted-foreground">
                          {t("merchant.orderedAt")} {formatTime(order.created_at)}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium">
                      {t("merchant.waitingPickup")}
                    </span>
                  </div>

                  <SwipeButton
                    onConfirm={() => handleCompleteOrder(order.id)}
                    label={t("merchant.swipeToConfirm")}
                    successLabel={t("merchant.confirmed")}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Completed Orders */}
      {filteredCompletedOrders.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4">
            {t("merchant.completedToday")} ({filteredCompletedOrders.length})
          </h2>
          
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredCompletedOrders.slice(0, 5).map((order) => (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold">{formatOrderNumber(order)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(order.created_at)}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">
                    {t("merchant.pickedUp")}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

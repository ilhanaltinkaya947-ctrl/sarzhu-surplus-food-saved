import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TicketCard } from "@/components/orders/TicketCard";
import { PickupSuccessScreen } from "@/components/orders/PickupSuccessScreen";
import { EmptyState } from "@/components/orders/EmptyState";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface Order {
  id: string;
  status: string;
  created_at: string;
  bag_id: string;
  shop_name: string;
  shop_image: string | null;
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "past">("active");
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(`
          id,
          status,
          created_at,
          bag_id,
          mystery_bags!inner(
            shop_id,
            shops!inner(
              name,
              image_url
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      const formattedOrders = ordersData?.map((order: any) => ({
        id: order.id,
        status: order.status,
        created_at: order.created_at,
        bag_id: order.bag_id,
        shop_name: order.mystery_bags?.shops?.name || "Unknown Shop",
        shop_image: order.mystery_bags?.shops?.image_url,
      })) || [];

      setOrders(formattedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchOrders();
    }
  }, [authLoading, fetchOrders]);

  const handleConfirmPickup = async (order: Order) => {
    setProcessingOrderId(order.id);

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "picked_up" })
        .eq("id", order.id);

      if (error) throw error;

      setSuccessOrder(order);
      
      setOrders(prev => 
        prev.map(o => o.id === order.id ? { ...o, status: "picked_up" } : o)
      );
    } catch (error) {
      console.error("Error confirming pickup:", error);
      toast({
        title: t("general.error"),
        description: t("general.retry"),
        variant: "destructive",
      });
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleCloseSuccess = () => {
    setSuccessOrder(null);
    setActiveTab("past");
  };

  const activeOrders = orders.filter(o => o.status === "reserved" || o.status === "pending");
  const pastOrders = orders.filter(o => o.status === "picked_up" || o.status === "cancelled");

  const displayedOrders = activeTab === "active" ? activeOrders : pastOrders;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm">
        <div className="px-4 py-6 pt-safe">
          <h1 className="text-3xl font-bold text-foreground">{t("orders.title")}</h1>
        </div>

        {user && orders.length > 0 && (
          <div className="px-4 pb-4">
            <div className="flex rounded-xl bg-secondary p-1">
              <button
                onClick={() => setActiveTab("active")}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                  activeTab === "active"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                {t("orders.active")} ({activeOrders.length})
              </button>
              <button
                onClick={() => setActiveTab("past")}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                  activeTab === "past"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                {t("orders.past")} ({pastOrders.length})
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="px-4 pb-24">
        {!user || orders.length === 0 ? (
          <EmptyState isLoggedIn={!!user} />
        ) : displayedOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground">
              {activeTab === "active" 
                ? t("orders.noActive")
                : t("orders.noPast")
              }
            </p>
          </div>
        ) : (
          <motion.div 
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            {displayedOrders.map((order) => (
              <TicketCard
                key={order.id}
                order={order}
                onConfirmPickup={() => handleConfirmPickup(order)}
                isProcessing={processingOrderId === order.id}
              />
            ))}
          </motion.div>
        )}
      </main>

      {successOrder && (
        <PickupSuccessScreen
          open={!!successOrder}
          orderId={successOrder.id}
          shopName={successOrder.shop_name}
          onClose={handleCloseSuccess}
        />
      )}
    </div>
  );
}

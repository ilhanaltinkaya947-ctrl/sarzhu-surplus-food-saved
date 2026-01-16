import { useState, useEffect } from "react";
import { ShoppingBag, Clock, CheckCircle, MapPin, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import QRCode from "react-qr-code";

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) {
        setOrders([]);
        setLoading(false);
        return;
      }

      try {
        // Fetch orders with shop info
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
    }

    if (!authLoading) {
      fetchOrders();
    }
  }, [user, authLoading]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "reserved":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
            <Clock className="h-3 w-3" />
            Reserved
          </span>
        );
      case "picked_up":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
            <CheckCircle className="h-3 w-3" />
            Picked Up
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
            {status}
          </span>
        );
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-4 pt-safe">
          <h1 className="text-xl font-bold text-foreground">My Orders</h1>
          <Link
            to="/"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary"
          >
            <MapPin className="h-5 w-5 text-foreground" />
          </Link>
        </div>
      </header>
      
      <main className="pt-20 pb-8 px-4">
        {!user ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center mb-4">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Sign in to see orders
            </h2>
            <p className="text-sm text-muted-foreground text-center max-w-xs mb-4">
              Create an account or sign in to view your order history
            </p>
            <Link
              to="/"
              className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground"
            >
              Go to Map
            </Link>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center mb-4">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              No orders yet
            </h2>
            <p className="text-sm text-muted-foreground text-center max-w-xs mb-4">
              Start saving food and money by reserving a mystery bag from shops near you
            </p>
            <Link
              to="/"
              className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground"
            >
              Find Bags
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                className="rounded-2xl bg-card border border-border overflow-hidden shadow-sm transition-all cursor-pointer hover:shadow-md"
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Shop Image */}
                  <div className="h-16 w-16 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={order.shop_image || "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200"}
                      alt={order.shop_name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Order Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">
                      {order.shop_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(order.created_at)}
                    </p>
                  </div>

                  {/* Status & Arrow */}
                  <div className="flex items-center gap-2">
                    {getStatusBadge(order.status)}
                    <ChevronRight className={`h-5 w-5 text-muted-foreground transition-transform ${selectedOrder?.id === order.id ? 'rotate-90' : ''}`} />
                  </div>
                </div>

                {/* Expanded QR Section */}
                {selectedOrder?.id === order.id && order.status === "reserved" && (
                  <div className="border-t border-border p-4 bg-secondary/30 animate-fade-in">
                    <div className="flex flex-col items-center">
                      <p className="text-sm text-muted-foreground mb-3">
                        Show this QR code at pickup
                      </p>
                      <div className="rounded-xl bg-white p-3 shadow-sm">
                        <QRCode
                          value={order.id}
                          size={120}
                          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                          viewBox={`0 0 256 256`}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">
                        Pick up before 21:00 today
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { 
  Minus, 
  Plus, 
  Clock, 
  DollarSign,
  ShoppingBag,
  AlertCircle,
  CheckCircle2,
  Camera
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { QRScannerModal } from "@/components/merchant/QRScannerModal";
import { ScanSuccessOverlay } from "@/components/merchant/ScanSuccessOverlay";

interface ShopData {
  id: string;
  name: string;
  isOpen: boolean;
  mysteryBagId: string | null;
  bagsAvailable: number;
  originalPrice: number;
  discountedPrice: number;
}

interface OrderWithDetails {
  id: string;
  status: string;
  created_at: string;
  user_id: string;
}

export default function MerchantDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [shop, setShop] = useState<ShopData | null>(null);
  const [activeOrders, setActiveOrders] = useState<OrderWithDetails[]>([]);
  const [completedOrders, setCompletedOrders] = useState<OrderWithDetails[]>([]);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [ordersToPickup, setOrdersToPickup] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scannedOrderId, setScannedOrderId] = useState<string | null>(null);

  // Fetch shop data
  const fetchShopData = useCallback(async () => {
    if (!user) return;

    try {
      // Get shop owned by this user
      const { data: shopData, error: shopError } = await supabase
        .from("shops")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (shopError) throw shopError;
      if (!shopData) {
        setShop(null);
        setLoading(false);
        return;
      }

      // Get mystery bag for this shop
      const { data: bagData, error: bagError } = await supabase
        .from("mystery_bags")
        .select("*")
        .eq("shop_id", shopData.id)
        .maybeSingle();

      if (bagError && bagError.code !== "PGRST116") throw bagError;

      setShop({
        id: shopData.id,
        name: shopData.name,
        isOpen: true, // Would need a column for this
        mysteryBagId: bagData?.id || null,
        bagsAvailable: bagData?.quantity_available || 0,
        originalPrice: bagData?.original_price || 0,
        discountedPrice: bagData?.discounted_price || 0,
      });

      // Fetch today's orders
      if (bagData) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select("*")
          .eq("bag_id", bagData.id)
          .gte("created_at", todayStart.toISOString())
          .order("created_at", { ascending: false });

        if (ordersError) throw ordersError;

        const orders = ordersData || [];
        const reserved = orders.filter(o => o.status === "reserved");
        const pickedUp = orders.filter(o => o.status === "picked_up");
        
        setActiveOrders(reserved);
        setCompletedOrders(pickedUp);
        setOrdersToPickup(reserved.length);
        
        // Calculate revenue from picked up orders
        setTodayRevenue(pickedUp.length * (bagData.discounted_price || 0));
      }
    } catch (error) {
      console.error("Error fetching shop data:", error);
      toast({
        title: "Error",
        description: "Failed to load shop data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (!authLoading) {
      fetchShopData();
    }
  }, [authLoading, fetchShopData]);

  // Real-time subscription for order updates
  useEffect(() => {
    if (!shop?.mysteryBagId) return;

    const channel = supabase
      .channel('merchant-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `bag_id=eq.${shop.mysteryBagId}`,
        },
        (payload) => {
          console.log('Order update:', payload);
          // Refresh data on any order change
          fetchShopData();
          
          // Show notification for new orders
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New Order! 🛒",
              description: `Order #${(payload.new as any).id.slice(0, 8).toUpperCase()} received`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shop?.mysteryBagId, fetchShopData, toast]);

  // Update bag quantity
  const updateBagQuantity = async (delta: number) => {
    if (!shop?.mysteryBagId || updating) return;
    
    const newQuantity = Math.max(0, shop.bagsAvailable + delta);
    setUpdating(true);

    try {
      const { error } = await supabase
        .from("mystery_bags")
        .update({ quantity_available: newQuantity })
        .eq("id", shop.mysteryBagId);

      if (error) throw error;

      setShop(prev => prev ? { ...prev, bagsAvailable: newQuantity } : null);
      
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(10);
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  // Handle QR scan
  const handleScan = async (orderId: string) => {
    setShowScanner(false);
    
    try {
      // Verify order exists and belongs to this shop
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*, mystery_bags!inner(shop_id)")
        .eq("id", orderId)
        .maybeSingle();

      if (orderError || !orderData) {
        toast({
          title: "Order Not Found",
          description: "This QR code is not valid",
          variant: "destructive",
        });
        return;
      }

      if ((orderData as any).mystery_bags?.shop_id !== shop?.id) {
        toast({
          title: "Wrong Shop",
          description: "This order is for a different shop",
          variant: "destructive",
        });
        return;
      }

      if (orderData.status === "picked_up") {
        toast({
          title: "Already Collected",
          description: "This order has already been picked up",
          variant: "destructive",
        });
        return;
      }

      // Update order status
      const { error: updateError } = await supabase
        .from("orders")
        .update({ status: "picked_up" })
        .eq("id", orderId);

      if (updateError) throw updateError;

      // Show success screen
      setScannedOrderId(orderId);
      
      // Refresh data
      fetchShopData();
    } catch (error) {
      console.error("Error processing scan:", error);
      toast({
        title: "Error",
        description: "Failed to process order",
        variant: "destructive",
      });
    }
  };

  // Manual pickup confirmation
  const handleManualPickup = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "picked_up" })
        .eq("id", orderId);

      if (error) throw error;

      setScannedOrderId(orderId);
      fetchShopData();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive",
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-KZ", {
      style: "currency",
      currency: "KZT",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-xl font-bold text-foreground mb-2">Sign In Required</h1>
        <p className="text-muted-foreground text-center mb-6">
          Please sign in to access the merchant dashboard
        </p>
        <Link
          to="/"
          className="rounded-xl bg-foreground px-6 py-3 font-semibold text-white"
        >
          Go Back
        </Link>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-xl font-bold text-foreground mb-2">No Shop Found</h1>
        <p className="text-muted-foreground text-center mb-6">
          You don't have a shop associated with your account
        </p>
        <Link
          to="/"
          className="rounded-xl bg-foreground px-6 py-3 font-semibold text-white"
        >
          Go Back
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-safe">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 pt-safe">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">{shop.name}</h1>
            <p className="text-sm text-muted-foreground">Merchant Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {shop.isOpen ? "Open" : "Closed"}
            </span>
            <Switch
              checked={shop.isOpen}
              onCheckedChange={(checked) => 
                setShop(prev => prev ? { ...prev, isOpen: checked } : null)
              }
            />
          </div>
        </div>
      </header>

      <main className="px-6 py-6 space-y-6">
        {/* Scan QR Button */}
        <button
          onClick={() => setShowScanner(true)}
          className="w-full flex items-center justify-center gap-3 rounded-2xl bg-primary py-4 font-semibold text-primary-foreground shadow-lg transition-all active:scale-[0.98]"
        >
          <Camera className="h-6 w-6" />
          Scan Customer QR
        </button>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Orders to Pickup */}
          <div className="rounded-2xl border-2 border-foreground bg-white p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-5 w-5 text-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                To Pickup
              </span>
            </div>
            <p className="text-4xl font-bold text-foreground">{ordersToPickup}</p>
          </div>

          {/* Revenue Today */}
          <div className="rounded-2xl border-2 border-foreground bg-white p-5">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-5 w-5 text-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Today
              </span>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {formatPrice(todayRevenue)}
            </p>
          </div>
        </div>

        {/* Inventory Control */}
        <div className="rounded-2xl border-2 border-foreground bg-white p-5">
          <h2 className="text-lg font-bold text-foreground mb-4">
            Mystery Bags Available
          </h2>
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => updateBagQuantity(-1)}
              disabled={updating || shop.bagsAvailable === 0}
              className="h-16 w-16 rounded-2xl border-2 border-foreground bg-white flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
            >
              <Minus className="h-8 w-8 text-foreground" />
            </button>
            
            <span className="text-5xl font-bold text-foreground min-w-[80px] text-center">
              {shop.bagsAvailable}
            </span>
            
            <button
              onClick={() => updateBagQuantity(1)}
              disabled={updating}
              className="h-16 w-16 rounded-2xl border-2 border-foreground bg-foreground flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
            >
              <Plus className="h-8 w-8 text-white" />
            </button>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            {formatPrice(shop.discountedPrice)} per bag • {formatPrice(shop.originalPrice)} original
          </p>
        </div>

        {/* Active Reservations */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">
            Active Reservations
          </h2>
          
          {activeOrders.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center">
              <p className="text-muted-foreground">No active reservations</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {activeOrders.map((order) => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, x: 100 }}
                    className="flex items-center justify-between rounded-2xl border-2 border-foreground bg-white p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
                        <Clock className="h-6 w-6 text-foreground" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">
                          {formatTime(order.created_at)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleManualPickup(order.id)}
                      className="h-12 rounded-xl bg-emerald-500 px-4 font-semibold text-white transition-all active:scale-95"
                    >
                      Mark Done
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Completed Today */}
        {completedOrders.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">
              Completed Today ({completedOrders.length})
            </h2>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {completedOrders.slice(0, 5).map((order) => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-bold text-foreground">
                          {formatTime(order.created_at)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600">
                      Picked up
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>

      {/* QR Scanner Modal */}
      <QRScannerModal
        open={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleScan}
      />

      {/* Success Overlay */}
      <AnimatePresence>
        {scannedOrderId && (
          <ScanSuccessOverlay
            orderId={scannedOrderId}
            onClose={() => setScannedOrderId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

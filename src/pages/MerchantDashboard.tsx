import { useState, useEffect, useCallback } from "react";
import { 
  Camera, 
  Minus, 
  Plus, 
  Check, 
  X, 
  Clock, 
  DollarSign,
  ShoppingBag,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { QRScannerModal } from "@/components/merchant/QRScannerModal";
import { ScanResultOverlay } from "@/components/merchant/ScanResultOverlay";

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
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [ordersToPickup, setOrdersToPickup] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Scanner state
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);

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
        setActiveOrders(orders.filter(o => o.status === "reserved"));
        setOrdersToPickup(orders.filter(o => o.status === "reserved").length);
        
        // Calculate revenue from picked up orders
        const pickedUpCount = orders.filter(o => o.status === "picked_up").length;
        setTodayRevenue(pickedUpCount * (bagData.discounted_price || 0));
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
    setScannerOpen(false);

    try {
      // Look up the order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*, mystery_bags!inner(shop_id)")
        .eq("id", orderId)
        .maybeSingle();

      if (orderError || !order) {
        setScanResult({ success: false, message: "Order not found" });
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        return;
      }

      // Check if this order belongs to this shop
      if (order.mystery_bags.shop_id !== shop?.id) {
        setScanResult({ success: false, message: "Order belongs to another shop" });
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        return;
      }

      // Check if already picked up
      if (order.status === "picked_up") {
        setScanResult({ success: false, message: "Already picked up" });
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        return;
      }

      // Mark as picked up
      const { error: updateError } = await supabase
        .from("orders")
        .update({ status: "picked_up" })
        .eq("id", orderId);

      if (updateError) throw updateError;

      setScanResult({ success: true, message: "Order confirmed!" });
      
      // Play success sound
      playSuccessSound();
      
      // Refresh data
      fetchShopData();

      // Auto close after 3 seconds
      setTimeout(() => setScanResult(null), 3000);
    } catch (error) {
      console.error("Error processing scan:", error);
      setScanResult({ success: false, message: "Error processing order" });
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
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

      toast({
        title: "Success",
        description: "Order marked as picked up",
      });

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

  const playSuccessSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      // Audio not supported
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
    <div className="min-h-screen bg-white">
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

      <main className="px-6 py-6 space-y-6 pb-safe">
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
              {activeOrders.map((order) => (
                <div
                  key={order.id}
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
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Scan Button - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-border pb-safe">
        <button
          onClick={() => setScannerOpen(true)}
          className="w-full h-16 rounded-2xl bg-foreground flex items-center justify-center gap-3 font-bold text-white text-lg transition-all active:scale-[0.98]"
        >
          <Camera className="h-6 w-6" />
          SCAN QR CODE
        </button>
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScan}
      />

      {/* Scan Result Overlay */}
      <ScanResultOverlay
        result={scanResult}
        onClose={() => setScanResult(null)}
      />
    </div>
  );
}

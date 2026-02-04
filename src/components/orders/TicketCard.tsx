import { Clock, QrCode, Navigation, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

interface TicketCardProps {
  order: {
    id: string;
    status: string;
    created_at: string;
    shop_name: string;
    shop_image: string | null;
    shop_lat?: number;
    shop_long?: number;
    shop_address?: string | null;
  };
}

export function TicketCard({ order }: TicketCardProps) {
  const { t } = useLanguage();
  const shortOrderId = order.id.slice(0, 8).toUpperCase();
  
  const formatPickupTime = () => {
    const date = new Date(order.created_at);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday && order.status === "reserved") {
      return t("orders.todayPickup");
    }
    return date.toLocaleDateString("ru-RU", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const open2GISRoute = () => {
    if (!order.shop_lat || !order.shop_long) return;
    const url = `https://2gis.kz/almaty/directions/points/${order.shop_long}%2C${order.shop_lat}?m=${order.shop_long}%2C${order.shop_lat}%2F16`;
    window.open(url, '_blank');
  };

  const hasCoordinates = order.shop_lat && order.shop_long;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-card shadow-elevated"
    >
      {/* Top Section - Shop Image */}
      <div className="relative h-32 overflow-hidden">
        <img
          src={order.shop_image || "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600"}
          alt={order.shop_name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Status Badge */}
        {(order.status === "reserved" || order.status === "pending") && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
              <Clock className="h-3 w-3" />
              {t("orders.reserved")}
            </span>
          </div>
        )}
        {order.status === "picked_up" && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
              {t("orders.completed")}
            </span>
          </div>
        )}
        
        {/* Shop name overlay */}
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="text-lg font-bold text-white drop-shadow-md">
            {order.shop_name}
          </h3>
        </div>
      </div>

      {/* Middle Section - Order Info */}
      <div className="p-4 space-y-2">
        {(order.status === "reserved" || order.status === "pending") ? (
          <p className="text-sm font-semibold text-destructive">
            {t("orders.pickupBy")} {formatPickupTime()}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t("orders.pickedUpOn")} {formatPickupTime()}
          </p>
        )}
        
        {order.shop_address && (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            {order.shop_address}
          </p>
        )}
        
        <p className="text-xs text-muted-foreground">
          {t("orders.orderNumber")} #{shortOrderId}
        </p>
      </div>

      {/* Route Button for Active Orders */}
      {(order.status === "reserved" || order.status === "pending") && hasCoordinates && (
        <div className="px-4 pb-3">
          <button
            onClick={open2GISRoute}
            className="w-full py-3 rounded-xl bg-primary/10 text-primary font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors active:scale-[0.98]"
          >
            <Navigation className="h-4 w-4" />
            {t("orders.openRoute")}
          </button>
        </div>
      )}

      {/* Tear-off Separator */}
      <div className="relative px-4">
        <div className="border-t-2 border-dashed border-border" />
        {/* Circle cutouts */}
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-background" />
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-background" />
      </div>

      {/* Bottom Section - Info */}
      {(order.status === "reserved" || order.status === "pending") ? (
        <div className="p-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-primary">
            <QrCode className="h-5 w-5" />
            <span className="text-sm font-semibold">{t("orders.orderNumber")} #{shortOrderId}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("orders.showCode")}
          </p>
        </div>
      ) : (
        <div className="p-4 text-center">
          <span className="text-sm text-muted-foreground">{t("orders.thankYou")} 🌱</span>
        </div>
      )}
    </motion.div>
  );
}

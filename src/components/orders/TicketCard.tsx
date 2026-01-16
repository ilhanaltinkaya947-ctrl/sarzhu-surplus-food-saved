import { Clock, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface TicketCardProps {
  order: {
    id: string;
    status: string;
    created_at: string;
    shop_name: string;
    shop_image: string | null;
  };
  onShowQR: () => void;
}

export function TicketCard({ order, onShowQR }: TicketCardProps) {
  const shortOrderId = order.id.slice(0, 8).toUpperCase();
  
  const formatPickupTime = () => {
    const date = new Date(order.created_at);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday && order.status === "reserved") {
      return "Today, 18:00 - 21:00";
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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
        {order.status === "reserved" && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
              <Clock className="h-3 w-3" />
              Reserved
            </span>
          </div>
        )}
        {order.status === "picked_up" && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
              Completed
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
      <div className="p-4 space-y-1">
        {order.status === "reserved" ? (
          <p className="text-sm font-semibold text-destructive">
            Pickup {formatPickupTime()}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Picked up on {formatPickupTime()}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Order #{shortOrderId}
        </p>
      </div>

      {/* Tear-off Separator */}
      <div className="relative px-4">
        <div className="border-t-2 border-dashed border-border" />
        {/* Circle cutouts */}
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-background" />
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-background" />
      </div>

      {/* Bottom Section - Action */}
      {order.status === "reserved" ? (
        <button
          onClick={onShowQR}
          className="flex w-full items-center justify-between p-4 transition-colors active:bg-secondary/50"
        >
          <span className="font-semibold text-foreground">Show QR Code</span>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </button>
      ) : (
        <div className="p-4">
          <span className="text-sm text-muted-foreground">Thanks for saving food! 🌱</span>
        </div>
      )}
    </motion.div>
  );
}

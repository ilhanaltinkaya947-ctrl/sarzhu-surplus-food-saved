import { CheckCircle, X } from "lucide-react";
import QRCode from "react-qr-code";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OrderConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  shopName: string;
}

export function OrderConfirmationModal({
  open,
  onOpenChange,
  orderId,
  shopName,
}: OrderConfirmationModalProps) {
  const shortOrderId = orderId.slice(0, 8).toUpperCase();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden">
        {/* Success Header */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-8 text-center text-white">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur">
            <CheckCircle className="h-12 w-12" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              Reservation Confirmed!
            </DialogTitle>
          </DialogHeader>
          <p className="mt-2 text-emerald-100">
            Your mystery bag is waiting for you
          </p>
        </div>

        {/* Order Details */}
        <div className="p-6 space-y-6">
          {/* Order Number */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Order Number</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              #{shortOrderId}
            </p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="rounded-2xl bg-white p-4 shadow-lg">
              <QRCode
                value={orderId}
                size={160}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox={`0 0 256 256`}
              />
            </div>
          </div>

          {/* Pickup Info */}
          <div className="rounded-2xl bg-secondary p-4 text-center">
            <p className="text-sm text-muted-foreground">Pick up at</p>
            <p className="font-semibold text-foreground text-lg mt-1">
              {shopName}
            </p>
            <p className="text-sm text-primary font-medium mt-2">
              Today before 21:00
            </p>
          </div>

          {/* Instructions */}
          <p className="text-center text-sm text-muted-foreground">
            Show this QR code to the shop staff to collect your mystery bag
          </p>

          {/* Done Button */}
          <button
            onClick={() => onOpenChange(false)}
            className="w-full rounded-2xl bg-primary py-4 font-semibold text-primary-foreground shadow-lg transition-all active:scale-[0.98]"
          >
            Done
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect } from "react";
import { X } from "lucide-react";
import QRCode from "react-qr-code";
import { motion, AnimatePresence } from "framer-motion";

interface QRModalProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
  shopName: string;
}

export function QRModal({ open, onClose, orderId, shopName }: QRModalProps) {
  const shortOrderId = orderId.slice(0, 8).toUpperCase();

  // Attempt to increase screen brightness (works on some mobile browsers)
  useEffect(() => {
    if (open && 'wakeLock' in navigator) {
      let wakeLock: WakeLockSentinel | null = null;
      
      const requestWakeLock = async () => {
        try {
          wakeLock = await navigator.wakeLock.request('screen');
        } catch (err) {
          console.log('Wake Lock not available');
        }
      };
      
      requestWakeLock();
      
      return () => {
        if (wakeLock) {
          wakeLock.release();
        }
      };
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col bg-background"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 pt-safe">
            <h2 className="text-lg font-semibold text-foreground">Your QR Code</h2>
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary transition-colors active:bg-secondary/70"
            >
              <X className="h-5 w-5 text-foreground" />
            </button>
          </div>

          {/* Main Content */}
          <div className="flex flex-1 flex-col items-center justify-center px-8">
            {/* QR Code with Pulsing Ring */}
            <div className="relative">
              {/* Pulsing rings */}
              <motion.div
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.3, 0.1, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -inset-6 rounded-3xl bg-primary/20"
              />
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.4, 0.2, 0.4],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.3,
                }}
                className="absolute -inset-3 rounded-2xl bg-primary/30"
              />
              
              {/* QR Code Container */}
              <div className="relative rounded-2xl bg-white p-6 shadow-elevated">
                <QRCode
                  value={orderId}
                  size={200}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  viewBox="0 0 256 256"
                  level="H"
                />
              </div>
            </div>

            {/* Order Info */}
            <div className="mt-8 text-center">
              <p className="text-2xl font-bold text-foreground">
                #{shortOrderId}
              </p>
              <p className="mt-2 text-muted-foreground">
                Show this to the staff at
              </p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {shopName}
              </p>
            </div>

            {/* Pickup Time */}
            <div className="mt-6 rounded-2xl bg-secondary px-6 py-4 text-center">
              <p className="text-sm text-muted-foreground">Pickup Window</p>
              <p className="mt-1 font-semibold text-foreground">
                Today, 18:00 - 21:00
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 pb-safe">
            <button
              onClick={onClose}
              className="w-full rounded-2xl bg-primary py-4 font-semibold text-primary-foreground shadow-lg transition-all active:scale-[0.98]"
            >
              Done
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useState, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { X, Camera, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QRScannerModalProps {
  open: boolean;
  onClose: () => void;
  onScan: (orderId: string) => void;
}

export function QRScannerModal({ open, onClose, onScan }: QRScannerModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    if (open) {
      // Check camera permission
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(() => setHasPermission(true))
        .catch(() => {
          setHasPermission(false);
          setError("Camera permission denied");
        });
    }
  }, [open]);

  const handleScan = (result: any) => {
    if (result && result[0]?.rawValue) {
      const scannedValue = result[0].rawValue;
      
      // Validate UUID format (order_id)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      if (uuidRegex.test(scannedValue)) {
        // Haptic feedback
        if (navigator.vibrate) navigator.vibrate(100);
        onScan(scannedValue);
      } else {
        setError("Invalid QR code. Please scan a valid order code.");
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  const handleError = (err: any) => {
    console.error("Scanner error:", err);
    setError("Scanner error. Please try again.");
    setTimeout(() => setError(null), 3000);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 pt-safe">
          <h2 className="text-lg font-bold text-white">Scan Customer QR</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        {/* Scanner Area */}
        <div className="flex-1 flex items-center justify-center px-8">
          {hasPermission === false ? (
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-white/60 mx-auto mb-4" />
              <p className="text-white/80 mb-2">Camera access required</p>
              <p className="text-white/60 text-sm">
                Please enable camera permissions in your browser settings
              </p>
            </div>
          ) : (
            <div className="relative w-full max-w-sm aspect-square">
              {/* Scanner */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden">
                <Scanner
                  onScan={handleScan}
                  onError={handleError}
                  styles={{
                    container: {
                      width: "100%",
                      height: "100%",
                    },
                    video: {
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    },
                  }}
                />
              </div>

              {/* Corner Markers */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Top Left */}
                <div className="absolute top-0 left-0 w-16 h-16 border-l-4 border-t-4 border-white rounded-tl-3xl" />
                {/* Top Right */}
                <div className="absolute top-0 right-0 w-16 h-16 border-r-4 border-t-4 border-white rounded-tr-3xl" />
                {/* Bottom Left */}
                <div className="absolute bottom-0 left-0 w-16 h-16 border-l-4 border-b-4 border-white rounded-bl-3xl" />
                {/* Bottom Right */}
                <div className="absolute bottom-0 right-0 w-16 h-16 border-r-4 border-b-4 border-white rounded-br-3xl" />
              </div>

              {/* Scanning Line Animation */}
              <motion.div
                className="absolute left-4 right-4 h-0.5 bg-primary"
                animate={{ top: ["10%", "90%", "10%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </div>
          )}
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-32 left-4 right-4"
            >
              <div className="bg-destructive text-destructive-foreground rounded-xl p-4 text-center">
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        <div className="p-6 pb-safe text-center">
          <div className="flex items-center justify-center gap-2 text-white/60 mb-2">
            <Camera className="h-5 w-5" />
            <span>Point camera at customer's QR code</span>
          </div>
          <p className="text-white/40 text-sm">
            The order will be marked as picked up automatically
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

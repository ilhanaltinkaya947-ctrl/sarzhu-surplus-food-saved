import { Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface ScanResultOverlayProps {
  result: { success: boolean; message: string } | null;
  onClose: () => void;
}

export function ScanResultOverlay({ result, onClose }: ScanResultOverlayProps) {
  useEffect(() => {
    if (result?.success) {
      // Auto close success after 3 seconds
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [result, onClose]);

  return (
    <AnimatePresence>
      {result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className={`fixed inset-0 z-[110] flex items-center justify-center ${
            result.success ? "bg-emerald-500" : "bg-red-500"
          }`}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex flex-col items-center"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
              className={`h-32 w-32 rounded-full flex items-center justify-center mb-8 ${
                result.success ? "bg-white" : "bg-white"
              }`}
            >
              {result.success ? (
                <Check className="h-16 w-16 text-emerald-500" strokeWidth={3} />
              ) : (
                <X className="h-16 w-16 text-red-500" strokeWidth={3} />
              )}
            </motion.div>

            {/* Message */}
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold text-white text-center"
            >
              {result.success ? "Success!" : "Error"}
            </motion.h1>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-white/90 text-center mt-2"
            >
              {result.message}
            </motion.p>

            {/* Tap to dismiss hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-16 text-white/60 text-sm"
            >
              Tap anywhere to dismiss
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

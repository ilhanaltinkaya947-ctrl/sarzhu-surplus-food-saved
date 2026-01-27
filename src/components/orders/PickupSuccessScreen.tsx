import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PickupSuccessScreenProps {
  orderId: string;
  shopName: string;
  pickupTime?: string;
  open: boolean;
  onClose: () => void;
}

export function PickupSuccessScreen({ 
  orderId, 
  shopName, 
  pickupTime = "21:00",
  open,
  onClose 
}: PickupSuccessScreenProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const shortOrderId = `#GOU-${orderId.slice(0, 4).toUpperCase()}`;

  // Update time every second for anti-screenshot proof
  useEffect(() => {
    if (!open) return;
    
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [open]);

  // Play success sound and haptics on open
  useEffect(() => {
    if (!open) return;
    
    playSuccessSound();
    
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
  }, [open]);

  const playSuccessSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // "Ding" sound - rising pleasant tone
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.15); // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.3); // G5
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      // Audio not supported
    }
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return { hours, minutes, seconds };
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const handleDone = () => {
    onClose();
    navigate("/");
  };

  const handleViewOrders = () => {
    onClose();
    navigate("/orders");
  };

  const time = formatTime(currentTime);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-white flex flex-col"
        >
          {/* Main Content - Centered */}
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            {/* Animated Checkmark */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="relative mb-8"
            >
              {/* Pulsing rings */}
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-emerald-500"
              />
              <motion.div
                animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.3 }}
                className="absolute inset-0 rounded-full bg-emerald-500"
              />
              
              {/* Checkmark circle */}
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.3 }}
                className="relative h-28 w-28 rounded-full bg-emerald-500 flex items-center justify-center shadow-xl shadow-emerald-500/30"
              >
                <motion.div
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
                  <Check className="h-14 w-14 text-white stroke-[3]" />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Success Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-2xl font-bold text-foreground mb-2"
            >
              Rescue Successful! 🎉
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="text-muted-foreground mb-8"
            >
              You just saved delicious food from going to waste
            </motion.p>

            {/* Live Clock (Security Feature) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-muted/50 rounded-3xl px-8 py-6 mb-8 border border-border"
            >
              <div className="flex items-baseline justify-center gap-1 font-mono">
                <span className="text-5xl font-bold text-foreground tabular-nums">
                  {time.hours}
                </span>
                <span className="text-5xl font-bold text-muted-foreground">:</span>
                <span className="text-5xl font-bold text-foreground tabular-nums">
                  {time.minutes}
                </span>
                <span className="text-5xl font-bold text-muted-foreground">:</span>
                <motion.span 
                  key={time.seconds}
                  initial={{ opacity: 0.5, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-5xl font-bold text-emerald-500 tabular-nums"
                >
                  {time.seconds}
                </motion.span>
              </div>
              <p className="text-sm text-muted-foreground text-center mt-2">
                {formatDate(currentTime)}
              </p>
            </motion.div>

            {/* Order Details Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="w-full max-w-sm bg-card rounded-2xl border border-border p-5 shadow-sm"
            >
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-foreground">{shopName}</h2>
                <p className="text-sm text-muted-foreground">{shortOrderId}</p>
              </div>
              
              <div className="flex items-center justify-center gap-2 py-3 px-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
                <MapPin className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700 dark:text-amber-500">
                  Pickup by {pickupTime}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Footer Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="px-6 pb-safe"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}
          >
            <button
              onClick={handleViewOrders}
              className="w-full h-14 rounded-2xl bg-foreground text-background font-semibold shadow-lg mb-3 active:scale-[0.98] transition-transform"
            >
              View My Orders
            </button>
            <button
              onClick={handleDone}
              className="w-full h-12 rounded-2xl text-muted-foreground font-medium active:scale-[0.98] transition-transform"
            >
              Back to Map
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

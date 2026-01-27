import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

interface ScanSuccessOverlayProps {
  orderId: string;
  onClose: () => void;
}

export function ScanSuccessOverlay({ orderId, onClose }: ScanSuccessOverlayProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const shortOrderId = orderId.slice(0, 8).toUpperCase();

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Play success sound
  useEffect(() => {
    playSuccessSound();
    
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
    
    // Auto close after 5 seconds
    const timeout = setTimeout(onClose, 5000);
    return () => clearTimeout(timeout);
  }, [onClose]);

  const playSuccessSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.15);
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.3);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      // Audio not supported
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-emerald-500 flex flex-col items-center justify-center px-6"
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-full bg-white/20 backdrop-blur-sm"
      >
        <X className="h-6 w-6 text-white" />
      </button>

      {/* Animated Checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        className="relative mb-8"
      >
        {/* Pulsing rings */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full bg-white"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.3 }}
          className="absolute inset-0 rounded-full bg-white"
        />
        
        {/* Checkmark circle */}
        <div className="relative h-32 w-32 rounded-full bg-white flex items-center justify-center shadow-2xl">
          <Check className="h-16 w-16 text-emerald-500 stroke-[3]" />
        </div>
      </motion.div>

      {/* Success Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-3xl font-bold text-white mb-2"
      >
        Order Collected!
      </motion.h1>

      {/* Live Time */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 mb-8"
      >
        <p className="text-5xl font-mono font-bold text-white text-center tabular-nums">
          {formatTime(currentTime)}
        </p>
      </motion.div>

      {/* Order ID */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="text-center"
      >
        <p className="text-white/80">Order</p>
        <p className="text-xl font-bold text-white">#{shortOrderId}</p>
      </motion.div>

      {/* Auto-close hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-12 text-white/60 text-sm"
      >
        Auto-closing in a few seconds...
      </motion.p>
    </motion.div>
  );
}

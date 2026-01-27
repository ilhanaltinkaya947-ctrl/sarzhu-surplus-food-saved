import { useState, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ChevronRight, ShoppingBag } from "lucide-react";

interface SwipeToReserveProps {
  onConfirm: () => void;
  price: string;
  disabled?: boolean;
}

export function SwipeToReserve({ onConfirm, price, disabled = false }: SwipeToReserveProps) {
  const [completed, setCompleted] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const maxX = 260; // Track width minus handle width
  
  // Transform x position to opacity for the text
  const textOpacity = useTransform(x, [0, maxX * 0.5], [1, 0]);
  const bgOpacity = useTransform(x, [0, maxX], [0, 1]);

  const handleDragEnd = () => {
    const currentX = x.get();
    
    if (currentX >= maxX * 0.85) {
      // Completed!
      animate(x, maxX, { type: "spring", stiffness: 400, damping: 30 });
      setCompleted(true);
      
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate([50, 30, 100]);
      
      // Play success sound
      playSuccessSound();
      
      // Trigger callback
      setTimeout(() => {
        onConfirm();
      }, 300);
    } else {
      // Snap back
      animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
    }
  };

  const playSuccessSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      // Audio not supported
    }
  };

  if (disabled) {
    return (
      <div className="relative h-14 w-full overflow-hidden rounded-full bg-gray-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-gray-500">
            Select a bag first
          </span>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="relative h-14 w-full overflow-hidden rounded-full bg-emerald-500">
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          <ShoppingBag className="h-5 w-5 text-white" />
          <span className="text-sm font-semibold text-white">
            Reserving...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Track */}
      <div
        ref={constraintsRef}
        className="relative h-14 w-full overflow-hidden rounded-full bg-secondary"
      >
        {/* Success background that appears as you slide */}
        <motion.div
          className="absolute inset-0 bg-primary"
          style={{ opacity: bgOpacity }}
        />
        
        {/* Text */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ opacity: textOpacity }}
        >
          <span className="text-sm font-semibold text-muted-foreground">
            Swipe to Reserve • {price}
          </span>
        </motion.div>

        {/* Draggable Handle */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: maxX }}
          dragElastic={0}
          onDragEnd={handleDragEnd}
          style={{ x }}
          className="absolute left-1 top-1 bottom-1 w-12 cursor-grab rounded-full bg-primary shadow-lg flex items-center justify-center active:cursor-grabbing"
        >
          <motion.div
            animate={{ x: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <ChevronRight className="h-6 w-6 text-primary-foreground" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

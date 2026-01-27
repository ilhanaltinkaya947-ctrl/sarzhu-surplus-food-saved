import { useState, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface SwipeToConfirmProps {
  onConfirm: () => void;
  disabled?: boolean;
}

export function SwipeToConfirm({ onConfirm, disabled = false }: SwipeToConfirmProps) {
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
      
      // Trigger callback
      setTimeout(() => {
        onConfirm();
      }, 200);
    } else {
      // Snap back
      animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
    }
  };

  if (disabled || completed) {
    return (
      <div className="relative h-14 w-full overflow-hidden rounded-full bg-emerald-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-emerald-600">
            {completed ? "Processing..." : "Already collected"}
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
          className="absolute inset-0 bg-emerald-500"
          style={{ opacity: bgOpacity }}
        />
        
        {/* Text */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ opacity: textOpacity }}
        >
          <span className="text-sm font-semibold text-muted-foreground">
            Slide to confirm pickup
          </span>
        </motion.div>

        {/* Draggable Handle */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: maxX }}
          dragElastic={0}
          onDragEnd={handleDragEnd}
          style={{ x }}
          className="absolute left-1 top-1 bottom-1 w-12 cursor-grab rounded-full bg-emerald-500 shadow-lg flex items-center justify-center active:cursor-grabbing"
        >
          <motion.div
            animate={{ x: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </motion.div>
        </motion.div>
      </div>

      {/* Warning text */}
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Only swipe this when you are in front of the staff
      </p>
    </div>
  );
}

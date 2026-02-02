import { useState, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface SwipeButtonProps {
  onConfirm: () => void;
  disabled?: boolean;
  label?: string;
  successLabel?: string;
}

export function SwipeButton({ 
  onConfirm, 
  disabled = false,
  label,
  successLabel 
}: SwipeButtonProps) {
  const { t } = useLanguage();
  const [completed, setCompleted] = useState(false);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const maxX = 240; // Track width minus handle width
  
  // Transform x position to opacity for the text
  const textOpacity = useTransform(x, [0, maxX * 0.5], [1, 0]);
  const bgOpacity = useTransform(x, [0, maxX], [0, 1]);
  const handleScale = useTransform(x, [maxX * 0.8, maxX], [1, 1.1]);

  const displayLabel = label || t("merchant.swipeToConfirm");
  const displaySuccessLabel = successLabel || t("merchant.confirmed");

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
          <Check className="h-5 w-5 text-emerald-600 mr-2" />
          <span className="text-sm font-semibold text-emerald-600">
            {completed ? displaySuccessLabel : t("merchant.alreadyCompleted")}
          </span>
        </div>
      </div>
    );
  }

  return (
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
          {displayLabel}
        </span>
      </motion.div>

      {/* Draggable Handle */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: maxX }}
        dragElastic={0}
        onDragEnd={handleDragEnd}
        style={{ x, scale: handleScale }}
        className={cn(
          "absolute left-1 top-1 bottom-1 w-12",
          "cursor-grab rounded-full bg-emerald-500 shadow-lg",
          "flex items-center justify-center active:cursor-grabbing"
        )}
      >
        <motion.div
          animate={{ x: [0, 4, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </motion.div>
      </motion.div>
    </div>
  );
}

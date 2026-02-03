import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
  showValue?: boolean;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-7 w-7",
};

export function StarRating({
  rating,
  onRatingChange,
  size = "md",
  readonly = false,
  showValue = false,
}: StarRatingProps) {
  const handleClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => handleClick(value)}
          disabled={readonly}
          className={cn(
            "transition-transform",
            !readonly && "hover:scale-110 active:scale-95 cursor-pointer",
            readonly && "cursor-default"
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              "transition-colors",
              value <= rating
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-muted-foreground/30"
            )}
          />
        </button>
      ))}
      {showValue && (
        <span className="ml-1 text-sm font-medium text-muted-foreground">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

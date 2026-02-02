import { ShoppingBag, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

interface EmptyStateProps {
  isLoggedIn: boolean;
}

export function EmptyState({ isLoggedIn }: EmptyStateProps) {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-6"
    >
      {/* Illustration */}
      <div className="relative mb-6">
        {/* Background circle */}
        <div className="h-32 w-32 rounded-full bg-secondary flex items-center justify-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground" strokeWidth={1.5} />
        </div>
        
        {/* Decorative dots */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-primary/30"
        />
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          className="absolute -bottom-1 -left-3 h-3 w-3 rounded-full bg-primary/20"
        />
      </div>

      {/* Text */}
      {isLoggedIn ? (
        <>
          <h2 className="text-xl font-bold text-foreground mb-2">
            {t("empty.title")}
          </h2>
          <p className="text-muted-foreground text-center max-w-xs mb-8">
            {t("empty.subtitle")}
          </p>
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold text-foreground mb-2">
            {t("empty.signInTitle")}
          </h2>
          <p className="text-muted-foreground text-center max-w-xs mb-8">
            {t("empty.signInSubtitle")}
          </p>
        </>
      )}

      {/* CTA Button */}
      <Link
        to="/"
        className="flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 font-semibold text-primary-foreground shadow-lg transition-all active:scale-[0.98]"
      >
        <MapPin className="h-5 w-5" />
        {t("empty.explore")}
      </Link>
    </motion.div>
  );
}

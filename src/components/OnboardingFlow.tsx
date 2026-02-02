import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, MapPin, Rocket, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import smartPickerMascot from "@/assets/smart-picker-mascot.png";

interface OnboardingFlowProps {
  onComplete: () => void;
}

const slideKeys = [
  { icon: "bag", headlineKey: "onboarding.slide1.headline", bodyKey: "onboarding.slide1.body" },
  { icon: "map", headlineKey: "onboarding.slide2.headline", bodyKey: "onboarding.slide2.body" },
  { icon: "joe", headlineKey: "onboarding.slide3.headline", bodyKey: "onboarding.slide3.body" },
  { icon: "rocket", headlineKey: "onboarding.slide4.headline", bodyKey: "onboarding.slide4.body", isLast: true },
];

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { t } = useLanguage();

  const handleNext = () => {
    if (currentSlide < slideKeys.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const renderIcon = (iconType: string) => {
    switch (iconType) {
      case "bag":
        return (
          <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
            <ShoppingBag className="w-16 h-16 text-primary" strokeWidth={1.5} />
          </div>
        );
      case "map":
        return (
          <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
            <MapPin className="w-16 h-16 text-primary" strokeWidth={1.5} />
          </div>
        );
      case "joe":
        return (
          <div className="w-40 h-40 rounded-full overflow-hidden shadow-2xl ring-4 ring-primary/20">
            <img 
              src={smartPickerMascot} 
              alt="Joe the AI Assistant" 
              className="w-full h-full object-cover scale-125"
            />
          </div>
        );
      case "rocket":
        return (
          <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
            <Rocket className="w-16 h-16 text-primary" strokeWidth={1.5} />
          </div>
        );
      default:
        return null;
    }
  };

  const currentSlideData = slideKeys[currentSlide];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-background flex flex-col"
    >
      {/* Skip Button */}
      <div className="absolute top-safe-top right-4 pt-4 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkip}
          className="text-muted-foreground hover:text-foreground"
        >
          {t("onboarding.skip")}
          <X className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Slide Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center max-w-sm"
          >
            {/* Icon */}
            <div className="mb-8">
              {renderIcon(currentSlideData.icon)}
            </div>

            {/* Headline */}
            <h1 className="text-2xl font-bold text-foreground mb-4 leading-tight">
              {t(currentSlideData.headlineKey)}
            </h1>

            {/* Body */}
            <p className="text-muted-foreground leading-relaxed">
              {t(currentSlideData.bodyKey)}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="pb-safe-bottom px-8 pb-8">
        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mb-6">
          {slideKeys.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        {/* Action Button */}
        <Button
          onClick={handleNext}
          className="w-full h-14 text-lg font-semibold rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {currentSlideData.isLast ? (
            t("onboarding.start")
          ) : (
            <>
              {t("onboarding.next")}
              <ChevronRight className="w-5 h-5 ml-1" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}

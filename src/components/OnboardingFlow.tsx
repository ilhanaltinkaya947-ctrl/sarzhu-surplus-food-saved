import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, MapPin, Rocket, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import smartPickerMascot from "@/assets/smart-picker-mascot.png";

interface OnboardingFlowProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: "bag",
    headline: "Спасай еду — Экономь до 70%",
    body: "Рестораны и пекарни Алматы готовят вкусную еду каждый день. То, что не успели продать, мы предлагаем вам со скидкой до 70%. Вкусно, выгодно и экологично.",
  },
  {
    icon: "map",
    headline: "Забирай Magic Box",
    body: "Выберите заведение на карте, оплатите «Сюрприз-пакет» в приложении и заберите заказ в указанное время. Вы не знаете точно, что внутри, но это всегда вкусная и свежая еда.",
  },
  {
    icon: "joe",
    headline: "Разблокируй Личного Консьержа",
    body: "Сделайте 5 заказов, чтобы разблокировать доступ к умному чат-боту Джо. Он запомнит ваши вкусы и будет находить лучшие предложения персонально для вас.",
  },
  {
    icon: "rocket",
    headline: "Присоединяйся к стае",
    body: "Уже более 1000 кг еды спасено. Начните экономить прямо сейчас!",
    isLast: true,
  },
];

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
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
          <img 
            src={smartPickerMascot} 
            alt="Joe the AI Assistant" 
            className="w-48 h-48 object-contain drop-shadow-lg"
          />
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
          Пропустить
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
              {renderIcon(slides[currentSlide].icon)}
            </div>

            {/* Headline */}
            <h1 className="text-2xl font-bold text-foreground mb-4 leading-tight">
              {slides[currentSlide].headline}
            </h1>

            {/* Body */}
            <p className="text-muted-foreground leading-relaxed">
              {slides[currentSlide].body}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="pb-safe-bottom px-8 pb-8">
        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mb-6">
          {slides.map((_, index) => (
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
          {slides[currentSlide].isLast ? (
            "Погнали! 🚀"
          ) : (
            <>
              Далее
              <ChevronRight className="w-5 h-5 ml-1" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}

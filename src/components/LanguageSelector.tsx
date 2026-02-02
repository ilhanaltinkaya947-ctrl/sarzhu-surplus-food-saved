import { useLanguage, Language } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const languages: { code: Language; label: string; flag: string }[] = [
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "kz", label: "Қазақша", flag: "🇰🇿" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex flex-col gap-2">
      {languages.map((lang) => (
        <Button
          key={lang.code}
          variant={language === lang.code ? "default" : "outline"}
          className="justify-between h-12"
          onClick={() => setLanguage(lang.code)}
        >
          <span className="flex items-center gap-3">
            <span className="text-xl">{lang.flag}</span>
            <span>{lang.label}</span>
          </span>
          {language === lang.code && <Check className="w-5 h-5" />}
        </Button>
      ))}
    </div>
  );
}

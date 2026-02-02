import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "kz" | "ru";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_KEY = "app_language";

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Onboarding
    "onboarding.skip": "Skip",
    "onboarding.next": "Next",
    "onboarding.start": "Let's Go! 🚀",
    "onboarding.slide1.headline": "Save Food — Save up to 70%",
    "onboarding.slide1.body": "Restaurants and bakeries in Almaty prepare delicious food every day. What they couldn't sell, we offer you with up to 70% discount. Tasty, affordable, and eco-friendly.",
    "onboarding.slide2.headline": "Grab a Magic Box",
    "onboarding.slide2.body": "Choose a place on the map, pay for the 'Surprise Bag' in the app, and pick up your order at the specified time. You don't know exactly what's inside, but it's always fresh and delicious food.",
    "onboarding.slide3.headline": "Unlock Your Personal Concierge",
    "onboarding.slide3.body": "Complete 5 orders to unlock access to Joe, the smart chatbot. He'll remember your tastes and find the best deals personally for you.",
    "onboarding.slide4.headline": "Join the Pack",
    "onboarding.slide4.body": "Over 1000 kg of food already saved. Start saving now!",
    
    // Profile
    "profile.title": "Profile",
    "profile.guest": "Guest User",
    "profile.signIn": "Sign in to save progress",
    "profile.totalOrders": "Total Orders",
    "profile.moneySaved": "Money Saved",
    "profile.savedShops": "Saved Shops",
    "profile.paymentMethods": "Payment Methods",
    "profile.notifications": "Notifications",
    "profile.help": "Help & Support",
    "profile.language": "Language",
    "profile.signOut": "Sign Out",
    "profile.signInButton": "Sign In",
    
    // Bottom Sheet
    "bottomSheet.nearby": "Nearby",
    "bottomSheet.search": "Search for food...",
    
    // Orders
    "orders.title": "My Orders",
    "orders.active": "Active",
    "orders.history": "History",
    "orders.empty": "No orders yet",
    "orders.emptyDesc": "Start saving food and money!",
    
    // General
    "general.loading": "Loading...",
    "general.error": "Something went wrong",
    "general.retry": "Try again",
  },
  kz: {
    // Onboarding
    "onboarding.skip": "Өткізу",
    "onboarding.next": "Келесі",
    "onboarding.start": "Кеттік! 🚀",
    "onboarding.slide1.headline": "Тамақты сақта — 70%-ға дейін үнемде",
    "onboarding.slide1.body": "Алматыдағы мейрамханалар мен наубайханалар күн сайын дәмді тағам дайындайды. Сатылмай қалғанын біз сізге 70%-ға дейін жеңілдікпен ұсынамыз. Дәмді, тиімді және экологиялық таза.",
    "onboarding.slide2.headline": "Magic Box алыңыз",
    "onboarding.slide2.body": "Картадан орынды таңдаңыз, қосымшада 'Сюрприз-пакетті' төлеңіз және тапсырысыңызды көрсетілген уақытта алыңыз. Ішінде не барын дәл білмейсіз, бірақ ол әрқашан дәмді және жаңа тағам.",
    "onboarding.slide3.headline": "Жеке консьержіңізді ашыңыз",
    "onboarding.slide3.body": "Джо смарт чат-ботына қол жеткізу үшін 5 тапсырыс орындаңыз. Ол сіздің талғамыңызды есте сақтап, сізге жеке ең жақсы ұсыныстарды табады.",
    "onboarding.slide4.headline": "Топқа қосылыңыз",
    "onboarding.slide4.body": "1000 кг-нан астам тамақ сақталды. Қазір үнемдеуді бастаңыз!",
    
    // Profile
    "profile.title": "Профиль",
    "profile.guest": "Қонақ",
    "profile.signIn": "Прогрессті сақтау үшін кіріңіз",
    "profile.totalOrders": "Барлық тапсырыстар",
    "profile.moneySaved": "Үнемделген ақша",
    "profile.savedShops": "Сақталған дүкендер",
    "profile.paymentMethods": "Төлем әдістері",
    "profile.notifications": "Хабарландырулар",
    "profile.help": "Көмек және қолдау",
    "profile.language": "Тіл",
    "profile.signOut": "Шығу",
    "profile.signInButton": "Кіру",
    
    // Bottom Sheet
    "bottomSheet.nearby": "Жақын маңда",
    "bottomSheet.search": "Тамақ іздеу...",
    
    // Orders
    "orders.title": "Менің тапсырыстарым",
    "orders.active": "Белсенді",
    "orders.history": "Тарих",
    "orders.empty": "Тапсырыстар жоқ",
    "orders.emptyDesc": "Тамақ пен ақшаны үнемдеуді бастаңыз!",
    
    // General
    "general.loading": "Жүктелуде...",
    "general.error": "Бірдеңе дұрыс болмады",
    "general.retry": "Қайталап көріңіз",
  },
  ru: {
    // Onboarding
    "onboarding.skip": "Пропустить",
    "onboarding.next": "Далее",
    "onboarding.start": "Погнали! 🚀",
    "onboarding.slide1.headline": "Спасай еду — Экономь до 70%",
    "onboarding.slide1.body": "Рестораны и пекарни Алматы готовят вкусную еду каждый день. То, что не успели продать, мы предлагаем вам со скидкой до 70%. Вкусно, выгодно и экологично.",
    "onboarding.slide2.headline": "Забирай Magic Box",
    "onboarding.slide2.body": "Выберите заведение на карте, оплатите «Сюрприз-пакет» в приложении и заберите заказ в указанное время. Вы не знаете точно, что внутри, но это всегда вкусная и свежая еда.",
    "onboarding.slide3.headline": "Разблокируй Личного Консьержа",
    "onboarding.slide3.body": "Сделайте 5 заказов, чтобы разблокировать доступ к умному чат-боту Джо. Он запомнит ваши вкусы и будет находить лучшие предложения персонально для вас.",
    "onboarding.slide4.headline": "Присоединяйся к стае",
    "onboarding.slide4.body": "Уже более 1000 кг еды спасено. Начните экономить прямо сейчас!",
    
    // Profile
    "profile.title": "Профиль",
    "profile.guest": "Гость",
    "profile.signIn": "Войдите, чтобы сохранить прогресс",
    "profile.totalOrders": "Всего заказов",
    "profile.moneySaved": "Сэкономлено",
    "profile.savedShops": "Избранные",
    "profile.paymentMethods": "Способы оплаты",
    "profile.notifications": "Уведомления",
    "profile.help": "Помощь и поддержка",
    "profile.language": "Язык",
    "profile.signOut": "Выйти",
    "profile.signInButton": "Войти",
    
    // Bottom Sheet
    "bottomSheet.nearby": "Рядом",
    "bottomSheet.search": "Поиск еды...",
    
    // Orders
    "orders.title": "Мои заказы",
    "orders.active": "Активные",
    "orders.history": "История",
    "orders.empty": "Заказов пока нет",
    "orders.emptyDesc": "Начните экономить еду и деньги!",
    
    // General
    "general.loading": "Загрузка...",
    "general.error": "Что-то пошло не так",
    "general.retry": "Попробовать снова",
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ru");

  useEffect(() => {
    const saved = localStorage.getItem(LANGUAGE_KEY) as Language;
    if (saved && ["en", "kz", "ru"].includes(saved)) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_KEY, lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

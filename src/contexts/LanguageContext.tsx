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
    "profile.footer": "Made with 🐾 to reduce food waste",
    "profile.orderHistory": "Order History",
    "profile.noOrders": "No orders yet",
    
    // Bottom Nav
    "nav.map": "Map",
    "nav.orders": "Orders",
    "nav.profile": "Profile",
    
    // Categories
    "category.all": "All",
    "category.bakery": "Bakery",
    "category.coffee": "Coffee",
    "category.healthy": "Healthy",
    "category.grocery": "Grocery",
    
    // Bottom Sheet
    "bottomSheet.nearby": "Nearby",
    "bottomSheet.search": "Search for food...",
    "bottomSheet.featuredDeals": "Featured Deals",
    "bottomSheet.seeAll": "See all",
    "bottomSheet.noShops": "No shops available nearby",
    "bottomSheet.selectShop": "Select a shop to reserve",
    "bottomSheet.reserve": "Reserve",
    "bottomSheet.myOrders": "My Orders",
    "bottomSheet.nextTier": "Next",
    "bottomSheet.maxTier": "Max Tier! 👑",
    "bottomSheet.aiLocked": "🔒 AI Chat unlocks at Smart Picker tier!",
    "bottomSheet.ordersToUnlock": "Complete {count} more orders to unlock",
    
    // Shop Drawer
    "shop.openUntil": "Open until",
    "shop.away": "away",
    "shop.whatsInBag": "What's in the bag?",
    "shop.bagDescription": "A surprise selection of delicious items that would otherwise go to waste. Contents vary daily based on what's available!",
    "shop.mysteryBag": "Mystery Bag",
    "shop.bagsLeft": "bags left today",
    "shop.soldOutToday": "Sold out for today",
    "shop.priceBreakdown": "Price Breakdown",
    "shop.serviceFee": "Service Fee",
    "shop.legendPerk": "Legend Perk applied 👑",
    "shop.total": "Total",
    "shop.reserveFor": "Reserve for",
    "shop.soldOut": "Sold Out",
    "shop.reserving": "Reserving...",
    
    // Orders Page
    "orders.title": "My Bags",
    "orders.active": "Active",
    "orders.past": "Past",
    "orders.noActive": "No active reservations",
    "orders.noPast": "No past orders yet",
    "orders.pickupBy": "Pickup by",
    "orders.reserved": "Reserved",
    "orders.pickedUp": "Picked Up",
    "orders.swipeConfirm": "Swipe to confirm pickup",
    
    // Pickup Success
    "success.title": "Rescue Successful! 🎉",
    "success.subtitle": "You just saved delicious food from going to waste",
    "success.pickupBy": "Pickup by",
    "success.viewOrders": "View My Orders",
    "success.backToMap": "Back to Map",
    
    // Auth Modal
    "auth.welcomeBack": "Welcome Back",
    "auth.createAccount": "Create Account",
    "auth.signInSubtitle": "Sign in to reserve mystery bags",
    "auth.signUpSubtitle": "Join us to start saving food",
    "auth.continueGoogle": "Continue with Google",
    "auth.orEmail": "Or continue with email",
    "auth.email": "Email address",
    "auth.password": "Password",
    "auth.signIn": "Sign In",
    "auth.signUp": "Create Account",
    "auth.noAccount": "Don't have an account?",
    "auth.hasAccount": "Already have an account?",
    "auth.signUpLink": "Sign up",
    "auth.signInLink": "Sign in",
    "auth.successLogin": "Welcome back! 👋",
    "auth.successSignup": "Account created! You can now reserve bags.",
    
    // Loyalty Card
    "loyalty.status": "Loyalty Status",
    "loyalty.ordersCompleted": "orders completed",
    "loyalty.orderCompleted": "order completed",
    "loyalty.progressTo": "Progress to",
    "loyalty.moreOrders": "more orders to unlock",
    "loyalty.moreOrder": "more order to unlock",
    "loyalty.locked": "LOCKED",
    "loyalty.reachOrders": "Reach {count} orders to unlock",
    "loyalty.activePerks": "Your Active Perks",
    "loyalty.offFees": "20% off fees",
    "loyalty.firstAccess": "First access",
    "loyalty.monthlyRewards": "Monthly rewards",
    "loyalty.vipStatus": "VIP status",
    
    // Tier Benefits
    "tier.aiPowered": "AI-powered recommendations",
    "tier.personalizedAlerts": "Personalized deal alerts",
    "tier.lifetimeDiscount": "20% Lifetime Discount on fees",
    "tier.firstAccessBags": "First access to limited bags",
    "tier.monthlyRewards": "Monthly surprise rewards",
    
    // Tier Unlock Modal
    "tierUnlock.levelUp": "Level Up!",
    "tierUnlock.smartPickerUnlocked": "You've unlocked Smart Picker",
    "tierUnlock.legendary": "LEGENDARY STATUS!",
    "tierUnlock.legendUnlocked": "You've become a Legend",
    "tierUnlock.yourPerks": "Your New Perks",
    "tierUnlock.letsGo": "Let's Go! 🚀",
    "tierUnlock.aiAssistant": "🤖 AI Assistant Unlocked!",
    "tierUnlock.aiRecommendations": "🎯 AI-powered recommendations",
    "tierUnlock.dealAlerts": "📱 Personalized deal alerts",
    "tierUnlock.earlyNotifications": "⭐ Early notifications for popular items",
    "tierUnlock.vipStatus": "👑 VIP status with all perks",
    "tierUnlock.discountFees": "💰 20% off all service fees",
    "tierUnlock.limitedBags": "🚀 First access to limited bags",
    "tierUnlock.monthlyRewards": "🎁 Monthly surprise rewards",
    
    // Tier Names
    "tier.foodSaver": "Food Saver",
    "tier.smartPicker": "Smart Picker",
    "tier.legend": "Legend",
    
    // Empty State
    "empty.title": "No orders yet",
    "empty.subtitle": "Start saving food and money!",
    "empty.signInTitle": "Sign in to view orders",
    "empty.signInSubtitle": "Track your reservations and pickup history",
    "empty.explore": "Explore Nearby",
    "empty.signIn": "Sign In",
    
    // General
    "general.loading": "Loading...",
    "general.error": "Something went wrong",
    "general.retry": "Try again",
    "general.off": "OFF",
    "general.max": "MAX",
    
    // Joe Chat
    "joe.title": "Joe the Food Rescue Pup",
    "joe.subtitle": "Powered by AI 🐾",
    "joe.greeting": "Woof! 🐶 I'm Joe, your Food Rescue Pup. I sniff out the best surplus food deals in Almaty. What are you craving today?",
    "joe.placeholder": "Ask Joe about deals...",
    "joe.fallback": "Woof! I'm having trouble sniffing right now. Try asking me again! 🐾",
    "joe.errorFallback": "Woof! Something went wrong. Try again! 🐕",
    "joe.unavailable": "Joe is temporarily unavailable",
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
    "profile.moneySaved": "Үнемделген",
    "profile.savedShops": "Сақталғандар",
    "profile.paymentMethods": "Төлем әдістері",
    "profile.notifications": "Хабарландырулар",
    "profile.help": "Көмек",
    "profile.language": "Тіл",
    "profile.signOut": "Шығу",
    "profile.signInButton": "Кіру",
    "profile.footer": "🐾 Тамақ қалдықтарын азайту үшін жасалды",
    "profile.orderHistory": "Тапсырыстар тарихы",
    "profile.noOrders": "Тапсырыстар жоқ",
    
    // Bottom Nav
    "nav.map": "Карта",
    "nav.orders": "Тапсырыстар",
    "nav.profile": "Профиль",
    
    // Categories
    "category.all": "Барлығы",
    "category.bakery": "Наубайхана",
    "category.coffee": "Кофе",
    "category.healthy": "Салауатты",
    "category.grocery": "Азық-түлік",
    
    // Bottom Sheet
    "bottomSheet.nearby": "Жақын маңда",
    "bottomSheet.search": "Тамақ іздеу...",
    "bottomSheet.featuredDeals": "Таңдаулы ұсыныстар",
    "bottomSheet.seeAll": "Барлығын көру",
    "bottomSheet.noShops": "Жақын маңда дүкендер жоқ",
    "bottomSheet.selectShop": "Брондау үшін дүкен таңдаңыз",
    "bottomSheet.reserve": "Брондау",
    "bottomSheet.myOrders": "Тапсырыстарым",
    "bottomSheet.nextTier": "Келесі",
    "bottomSheet.maxTier": "Макс деңгей! 👑",
    "bottomSheet.aiLocked": "🔒 AI чат Smart Picker деңгейінде ашылады!",
    "bottomSheet.ordersToUnlock": "Ашу үшін тағы {count} тапсырыс орындаңыз",
    
    // Shop Drawer
    "shop.openUntil": "дейін ашық",
    "shop.away": "қашықтықта",
    "shop.whatsInBag": "Сөмкеде не бар?",
    "shop.bagDescription": "Әйтпесе ысырапқа кететін дәмді тағамдардың сюрприз таңдауы. Мазмұны қол жетімділікке байланысты күн сайын өзгереді!",
    "shop.mysteryBag": "Сюрприз-пакет",
    "shop.bagsLeft": "бүгін қалды",
    "shop.soldOutToday": "Бүгін таусылды",
    "shop.priceBreakdown": "Баға бөлшектері",
    "shop.serviceFee": "Қызмет ақысы",
    "shop.legendPerk": "Legend артықшылығы қолданылды 👑",
    "shop.total": "Барлығы",
    "shop.reserveFor": "Брондау",
    "shop.soldOut": "Таусылды",
    "shop.reserving": "Брондалуда...",
    
    // Orders Page
    "orders.title": "Менің сөмкелерім",
    "orders.active": "Белсенді",
    "orders.past": "Өткен",
    "orders.noActive": "Белсенді брондаулар жоқ",
    "orders.noPast": "Өткен тапсырыстар жоқ",
    "orders.pickupBy": "Алу уақыты",
    "orders.reserved": "Брондалған",
    "orders.pickedUp": "Алынған",
    "orders.swipeConfirm": "Растау үшін сырғытыңыз",
    
    // Pickup Success
    "success.title": "Сәтті құтқарылды! 🎉",
    "success.subtitle": "Сіз дәмді тамақты ысырапқа кетуден құтқардыңыз",
    "success.pickupBy": "Алу уақыты",
    "success.viewOrders": "Тапсырыстарымды көру",
    "success.backToMap": "Картаға оралу",
    
    // Auth Modal
    "auth.welcomeBack": "Қайта келдіңіз",
    "auth.createAccount": "Тіркелу",
    "auth.signInSubtitle": "Сюрприз-пакеттерді брондау үшін кіріңіз",
    "auth.signUpSubtitle": "Тамақ үнемдеуді бастау үшін қосылыңыз",
    "auth.continueGoogle": "Google арқылы жалғастыру",
    "auth.orEmail": "Немесе email арқылы",
    "auth.email": "Email мекенжайы",
    "auth.password": "Құпия сөз",
    "auth.signIn": "Кіру",
    "auth.signUp": "Тіркелу",
    "auth.noAccount": "Аккаунтыңыз жоқ па?",
    "auth.hasAccount": "Аккаунтыңыз бар ма?",
    "auth.signUpLink": "Тіркелу",
    "auth.signInLink": "Кіру",
    "auth.successLogin": "Қайта келдіңіз! 👋",
    "auth.successSignup": "Аккаунт жасалды! Енді сөмкелерді брондай аласыз.",
    
    // Loyalty Card
    "loyalty.status": "Адалдық мәртебесі",
    "loyalty.ordersCompleted": "тапсырыс орындалды",
    "loyalty.orderCompleted": "тапсырыс орындалды",
    "loyalty.progressTo": "дейін прогресс",
    "loyalty.moreOrders": "ашу үшін тағы тапсырыс",
    "loyalty.moreOrder": "ашу үшін тағы тапсырыс",
    "loyalty.locked": "ҚҰЛЫПТЫ",
    "loyalty.reachOrders": "Ашу үшін {count} тапсырысқа жетіңіз",
    "loyalty.activePerks": "Белсенді артықшылықтар",
    "loyalty.offFees": "Комиссияға 20% жеңілдік",
    "loyalty.firstAccess": "Бірінші қол жеткізу",
    "loyalty.monthlyRewards": "Ай сайынғы сыйлықтар",
    "loyalty.vipStatus": "VIP мәртебесі",
    
    // Tier Benefits
    "tier.aiPowered": "AI негізіндегі ұсыныстар",
    "tier.personalizedAlerts": "Жеке ұсыныс хабарландырулары",
    "tier.lifetimeDiscount": "Комиссияға 20% өмірлік жеңілдік",
    "tier.firstAccessBags": "Шектеулі сөмкелерге бірінші қол жеткізу",
    "tier.monthlyRewards": "Ай сайынғы сюрприз сыйлықтар",
    
    // Tier Unlock Modal
    "tierUnlock.levelUp": "Деңгей көтерілді!",
    "tierUnlock.smartPickerUnlocked": "Smart Picker ашылды",
    "tierUnlock.legendary": "АҢЫЗ МӘРТЕБЕСІ!",
    "tierUnlock.legendUnlocked": "Сіз Legend болдыңыз",
    "tierUnlock.yourPerks": "Жаңа артықшылықтарыңыз",
    "tierUnlock.letsGo": "Кеттік! 🚀",
    "tierUnlock.aiAssistant": "🤖 AI көмекшісі ашылды!",
    "tierUnlock.aiRecommendations": "🎯 AI негізіндегі ұсыныстар",
    "tierUnlock.dealAlerts": "📱 Жеке ұсыныс хабарландырулары",
    "tierUnlock.earlyNotifications": "⭐ Танымал тауарлар туралы ерте хабарландырулар",
    "tierUnlock.vipStatus": "👑 Барлық артықшылықтары бар VIP мәртебесі",
    "tierUnlock.discountFees": "💰 Барлық комиссияларға 20% жеңілдік",
    "tierUnlock.limitedBags": "🚀 Шектеулі сөмкелерге бірінші қол жеткізу",
    "tierUnlock.monthlyRewards": "🎁 Ай сайынғы сюрприз сыйлықтар",
    
    // Tier Names
    "tier.foodSaver": "Тамақ құтқарушы",
    "tier.smartPicker": "Ақылды таңдаушы",
    "tier.legend": "Аңыз",
    
    // Empty State
    "empty.title": "Тапсырыстар жоқ",
    "empty.subtitle": "Тамақ пен ақшаны үнемдеуді бастаңыз!",
    "empty.signInTitle": "Тапсырыстарды көру үшін кіріңіз",
    "empty.signInSubtitle": "Брондаулар мен алу тарихын қадағалаңыз",
    "empty.explore": "Жақын маңды зерттеу",
    "empty.signIn": "Кіру",
    
    // General
    "general.loading": "Жүктелуде...",
    "general.error": "Бірдеңе дұрыс болмады",
    "general.retry": "Қайталау",
    "general.off": "ЖЕҢІЛДІК",
    "general.max": "МАКС",
    
    // Joe Chat
    "joe.title": "Джо - Тамақ құтқарушы күшік",
    "joe.subtitle": "AI негізінде 🐾",
    "joe.greeting": "Гав! 🐶 Мен Джо, сіздің тамақ құтқарушы күшігіңіз. Мен Алматыдағы ең жақсы артық тамақ ұсыныстарын іздеймін. Бүгін не жегіңіз келеді?",
    "joe.placeholder": "Джодан ұсыныстар туралы сұраңыз...",
    "joe.fallback": "Гав! Қазір іздеуде қиындық туындады. Қайта сұрап көріңіз! 🐾",
    "joe.errorFallback": "Гав! Бірдеңе дұрыс болмады. Қайталаңыз! 🐕",
    "joe.unavailable": "Джо уақытша қол жетімді емес",
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
    "profile.help": "Помощь",
    "profile.language": "Язык",
    "profile.signOut": "Выйти",
    "profile.signInButton": "Войти",
    "profile.footer": "Сделано с 🐾 для сокращения пищевых отходов",
    "profile.orderHistory": "История заказов",
    "profile.noOrders": "Заказов пока нет",
    
    // Bottom Nav
    "nav.map": "Карта",
    "nav.orders": "Заказы",
    "nav.profile": "Профиль",
    
    // Categories
    "category.all": "Все",
    "category.bakery": "Пекарня",
    "category.coffee": "Кофе",
    "category.healthy": "Здоровое",
    "category.grocery": "Продукты",
    
    // Bottom Sheet
    "bottomSheet.nearby": "Рядом",
    "bottomSheet.search": "Поиск еды...",
    "bottomSheet.featuredDeals": "Лучшие предложения",
    "bottomSheet.seeAll": "Смотреть все",
    "bottomSheet.noShops": "Поблизости нет заведений",
    "bottomSheet.selectShop": "Выберите заведение",
    "bottomSheet.reserve": "Забронировать",
    "bottomSheet.myOrders": "Мои заказы",
    "bottomSheet.nextTier": "До",
    "bottomSheet.maxTier": "Макс уровень! 👑",
    "bottomSheet.aiLocked": "🔒 AI чат откроется на уровне Smart Picker!",
    "bottomSheet.ordersToUnlock": "Сделайте ещё {count} заказов",
    
    // Shop Drawer
    "shop.openUntil": "Открыто до",
    "shop.away": "отсюда",
    "shop.whatsInBag": "Что в сюрприз-пакете?",
    "shop.bagDescription": "Набор вкусных продуктов, которые иначе бы пропали. Содержимое меняется каждый день в зависимости от наличия!",
    "shop.mysteryBag": "Сюрприз-пакет",
    "shop.bagsLeft": "осталось сегодня",
    "shop.soldOutToday": "Распродано на сегодня",
    "shop.priceBreakdown": "Детали цены",
    "shop.serviceFee": "Сервисный сбор",
    "shop.legendPerk": "Привилегия Legend применена 👑",
    "shop.total": "Итого",
    "shop.reserveFor": "Забронировать за",
    "shop.soldOut": "Распродано",
    "shop.reserving": "Бронирование...",
    
    // Orders Page
    "orders.title": "Мои пакеты",
    "orders.active": "Активные",
    "orders.past": "История",
    "orders.noActive": "Нет активных бронирований",
    "orders.noPast": "Нет прошлых заказов",
    "orders.pickupBy": "Забрать до",
    "orders.reserved": "Забронировано",
    "orders.pickedUp": "Забрано",
    "orders.swipeConfirm": "Свайпните для подтверждения",
    
    // Pickup Success
    "success.title": "Успешно спасено! 🎉",
    "success.subtitle": "Вы только что спасли вкусную еду от выбрасывания",
    "success.pickupBy": "Забрать до",
    "success.viewOrders": "Мои заказы",
    "success.backToMap": "Вернуться на карту",
    
    // Auth Modal
    "auth.welcomeBack": "С возвращением",
    "auth.createAccount": "Регистрация",
    "auth.signInSubtitle": "Войдите, чтобы бронировать пакеты",
    "auth.signUpSubtitle": "Присоединяйтесь и начните экономить",
    "auth.continueGoogle": "Продолжить с Google",
    "auth.orEmail": "Или через email",
    "auth.email": "Email адрес",
    "auth.password": "Пароль",
    "auth.signIn": "Войти",
    "auth.signUp": "Зарегистрироваться",
    "auth.noAccount": "Нет аккаунта?",
    "auth.hasAccount": "Уже есть аккаунт?",
    "auth.signUpLink": "Регистрация",
    "auth.signInLink": "Войти",
    "auth.successLogin": "С возвращением! 👋",
    "auth.successSignup": "Аккаунт создан! Теперь можно бронировать.",
    
    // Loyalty Card
    "loyalty.status": "Статус лояльности",
    "loyalty.ordersCompleted": "заказов выполнено",
    "loyalty.orderCompleted": "заказ выполнен",
    "loyalty.progressTo": "Прогресс до",
    "loyalty.moreOrders": "заказов до открытия",
    "loyalty.moreOrder": "заказ до открытия",
    "loyalty.locked": "ЗАБЛОКИРОВАНО",
    "loyalty.reachOrders": "Сделайте {count} заказов для открытия",
    "loyalty.activePerks": "Ваши привилегии",
    "loyalty.offFees": "Скидка 20% на сборы",
    "loyalty.firstAccess": "Первый доступ",
    "loyalty.monthlyRewards": "Ежемесячные награды",
    "loyalty.vipStatus": "VIP статус",
    
    // Tier Benefits
    "tier.aiPowered": "AI-рекомендации",
    "tier.personalizedAlerts": "Персональные уведомления",
    "tier.lifetimeDiscount": "Пожизненная скидка 20% на сборы",
    "tier.firstAccessBags": "Первый доступ к лимитированным пакетам",
    "tier.monthlyRewards": "Ежемесячные сюрприз-награды",
    
    // Tier Unlock Modal
    "tierUnlock.levelUp": "Уровень повышен!",
    "tierUnlock.smartPickerUnlocked": "Вы открыли Smart Picker",
    "tierUnlock.legendary": "ЛЕГЕНДАРНЫЙ СТАТУС!",
    "tierUnlock.legendUnlocked": "Вы стали Легендой",
    "tierUnlock.yourPerks": "Ваши новые привилегии",
    "tierUnlock.letsGo": "Поехали! 🚀",
    "tierUnlock.aiAssistant": "🤖 AI Ассистент разблокирован!",
    "tierUnlock.aiRecommendations": "🎯 AI-рекомендации",
    "tierUnlock.dealAlerts": "📱 Персональные уведомления",
    "tierUnlock.earlyNotifications": "⭐ Ранние уведомления о популярных товарах",
    "tierUnlock.vipStatus": "👑 VIP статус со всеми привилегиями",
    "tierUnlock.discountFees": "💰 Скидка 20% на все сборы",
    "tierUnlock.limitedBags": "🚀 Первый доступ к лимитированным пакетам",
    "tierUnlock.monthlyRewards": "🎁 Ежемесячные сюрприз-награды",
    
    // Tier Names
    "tier.foodSaver": "Спасатель еды",
    "tier.smartPicker": "Умный выбор",
    "tier.legend": "Легенда",
    
    // Empty State
    "empty.title": "Заказов пока нет",
    "empty.subtitle": "Начните экономить еду и деньги!",
    "empty.signInTitle": "Войдите для просмотра заказов",
    "empty.signInSubtitle": "Отслеживайте бронирования и историю",
    "empty.explore": "Исследовать рядом",
    "empty.signIn": "Войти",
    
    // General
    "general.loading": "Загрузка...",
    "general.error": "Что-то пошло не так",
    "general.retry": "Попробовать снова",
    "general.off": "СКИДКА",
    "general.max": "МАКС",
    
    // Joe Chat
    "joe.title": "Джо — пёс-спасатель еды",
    "joe.subtitle": "На базе AI 🐾",
    "joe.greeting": "Гав! 🐶 Я Джо, ваш пёс-спасатель еды. Я вынюхиваю лучшие предложения излишков еды в Алматы. Что хотите попробовать сегодня?",
    "joe.placeholder": "Спросите Джо о предложениях...",
    "joe.fallback": "Гав! Сейчас у меня проблемы с поиском. Попробуйте спросить ещё раз! 🐾",
    "joe.errorFallback": "Гав! Что-то пошло не так. Попробуйте снова! 🐕",
    "joe.unavailable": "Джо временно недоступен",
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

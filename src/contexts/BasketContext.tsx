import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { toast } from "sonner";
import { useLanguage } from "./LanguageContext";

interface Shop {
  id: string;
  name: string;
  image_url: string | null;
  description: string | null;
}

interface MysteryBag {
  id: string;
  shop_id: string;
  quantity_available: number;
  original_price: number;
  discounted_price: number;
}

interface BasketItem {
  shop: Shop;
  bag: MysteryBag;
  quantity: number;
}

interface SavedCard {
  id: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
}

interface BasketContextType {
  items: BasketItem[];
  savedCards: SavedCard[];
  selectedCardId: string | null;
  addItem: (shop: Shop, bag: MysteryBag) => void;
  removeItem: (bagId: string) => void;
  clearBasket: () => void;
  getTotal: () => number;
  itemCount: number;
  addCard: (card: Omit<SavedCard, 'id'>) => void;
  removeCard: (cardId: string) => void;
  selectCard: (cardId: string | null) => void;
}

const BasketContext = createContext<BasketContextType | undefined>(undefined);

// Mock saved cards for demo
const MOCK_CARDS: SavedCard[] = [];

export function BasketProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BasketItem[]>([]);
  const [savedCards, setSavedCards] = useState<SavedCard[]>(MOCK_CARDS);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const { t } = useLanguage();

  const addItem = useCallback((shop: Shop, bag: MysteryBag) => {
    setItems(prev => {
      // Check if already in basket
      const existing = prev.find(item => item.bag.id === bag.id);
      if (existing) {
        toast.info(t("basket.alreadyInBasket"));
        return prev;
      }
      
      toast.success(t("basket.addedToBasket"));
      return [...prev, { shop, bag, quantity: 1 }];
    });
  }, [t]);

  const removeItem = useCallback((bagId: string) => {
    setItems(prev => prev.filter(item => item.bag.id !== bagId));
    toast.success(t("basket.removed"));
  }, [t]);

  const clearBasket = useCallback(() => {
    setItems([]);
  }, []);

  const getTotal = useCallback(() => {
    return items.reduce((sum, item) => sum + item.bag.discounted_price * item.quantity, 0);
  }, [items]);

  const addCard = useCallback((card: Omit<SavedCard, 'id'>) => {
    const newCard: SavedCard = {
      ...card,
      id: `card_${Date.now()}`,
    };
    setSavedCards(prev => [...prev, newCard]);
    setSelectedCardId(newCard.id);
    toast.success(t("basket.cardAdded"));
  }, [t]);

  const removeCard = useCallback((cardId: string) => {
    setSavedCards(prev => prev.filter(c => c.id !== cardId));
    if (selectedCardId === cardId) {
      setSelectedCardId(null);
    }
  }, [selectedCardId]);

  const selectCard = useCallback((cardId: string | null) => {
    setSelectedCardId(cardId);
  }, []);

  return (
    <BasketContext.Provider
      value={{
        items,
        savedCards,
        selectedCardId,
        addItem,
        removeItem,
        clearBasket,
        getTotal,
        itemCount: items.length,
        addCard,
        removeCard,
        selectCard,
      }}
    >
      {children}
    </BasketContext.Provider>
  );
}

export function useBasket() {
  const context = useContext(BasketContext);
  if (!context) {
    throw new Error("useBasket must be used within a BasketProvider");
  }
  return context;
}

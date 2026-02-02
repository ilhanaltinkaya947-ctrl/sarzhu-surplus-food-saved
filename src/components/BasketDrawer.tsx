import { useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { X, Trash2, CreditCard, Plus, ShoppingBag, ChevronRight, Check, Loader2 } from "lucide-react";
import { useBasket } from "@/contexts/BasketContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "./AuthModal";
import { supabase } from "@/integrations/supabase/client";
import confetti from "canvas-confetti";
import { toast } from "sonner";

interface BasketDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchaseComplete?: () => void;
}

const SERVICE_FEE = 200;

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-KZ", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(price);
};

export function BasketDrawer({ open, onOpenChange, onPurchaseComplete }: BasketDrawerProps) {
  const { items, savedCards, selectedCardId, removeItem, clearBasket, getTotal, addCard, selectCard } = useBasket();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [addingCard, setAddingCard] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const total = getTotal() + (items.length > 0 ? SERVICE_FEE : 0);

  const handleClose = () => onOpenChange(false);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 500) {
      handleClose();
    }
  };

  const handleAddCard = () => {
    if (cardNumber.length < 16 || expiry.length < 5 || cvc.length < 3) {
      toast.error(t("basket.invalidCard"));
      return;
    }

    const [month, year] = expiry.split("/");
    addCard({
      last4: cardNumber.slice(-4),
      brand: cardNumber.startsWith("4") ? "Visa" : cardNumber.startsWith("5") ? "Mastercard" : "Card",
      expiryMonth: parseInt(month),
      expiryYear: 2000 + parseInt(year),
    });

    setCardNumber("");
    setExpiry("");
    setCvc("");
    setAddingCard(false);
  };

  const handlePurchase = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (!selectedCardId) {
      toast.error(t("basket.selectCard"));
      return;
    }

    if (items.length === 0) return;

    setProcessing(true);

    try {
      // Create orders for each item
      for (const item of items) {
        // Decrement bag quantity
        const { error: updateError } = await supabase
          .from("mystery_bags")
          .update({ quantity_available: item.bag.quantity_available - 1 })
          .eq("id", item.bag.id);

        if (updateError) throw updateError;

        // Create order
        const { error: orderError } = await supabase
          .from("orders")
          .insert({
            user_id: user.id,
            bag_id: item.bag.id,
            status: "pending",
          });

        if (orderError) throw orderError;
      }

      // Success
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#10B981', '#34D399', '#6EE7B7'],
      });

      toast.success(t("basket.purchaseSuccess"));
      clearBasket();
      handleClose();
      onPurchaseComplete?.();

    } catch (error: any) {
      console.error("Purchase error:", error);
      toast.error(error.message || t("general.error"));
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\D/g, "").slice(0, 16);
    return v;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, "").slice(0, 4);
    if (v.length >= 2) {
      return v.slice(0, 2) + "/" + v.slice(2);
    }
    return v;
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[90dvh] rounded-t-3xl bg-background shadow-2xl flex flex-col"
          >
            {/* Drag Handle */}
            <div className="w-full h-10 flex items-center justify-center cursor-grab active:cursor-grabbing flex-shrink-0 touch-none">
              <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-5 pb-4 flex items-center justify-between border-b border-border">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                {t("basket.title")}
              </h2>
              <button onClick={handleClose} className="p-2 rounded-full hover:bg-secondary">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="py-12 text-center">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">{t("basket.empty")}</p>
                </div>
              ) : (
                <>
                  {/* Items */}
                  {items.map((item) => (
                    <div key={item.bag.id} className="flex gap-4 p-3 rounded-2xl bg-secondary/50">
                      <img
                        src={item.shop.image_url || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100"}
                        alt={item.shop.name}
                        className="h-16 w-16 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground">{item.shop.name}</h4>
                        <p className="text-sm text-muted-foreground">{t("shop.mysteryBag")}</p>
                        <p className="font-bold text-primary mt-1">{formatPrice(item.bag.discounted_price)}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.bag.id)}
                        className="self-center p-2 text-destructive hover:bg-destructive/10 rounded-full"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  {/* Price Breakdown */}
                  <div className="rounded-2xl bg-muted p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("basket.subtotal")}</span>
                      <span className="text-foreground">{formatPrice(getTotal())}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("shop.serviceFee")}</span>
                      <span className="text-foreground">{formatPrice(SERVICE_FEE)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="font-semibold">{t("shop.total")}</span>
                      <span className="font-bold text-primary text-lg">{formatPrice(total)}</span>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground">{t("basket.paymentMethod")}</h3>
                    
                    {savedCards.map((card) => (
                      <button
                        key={card.id}
                        onClick={() => selectCard(card.id)}
                        className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                          selectedCardId === card.id
                            ? "border-primary bg-primary/10"
                            : "border-border bg-secondary/50"
                        }`}
                      >
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-foreground">{card.brand} •••• {card.last4}</p>
                          <p className="text-xs text-muted-foreground">
                            {t("basket.expires")} {card.expiryMonth}/{card.expiryYear}
                          </p>
                        </div>
                        {selectedCardId === card.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </button>
                    ))}

                    {addingCard ? (
                      <div className="p-4 rounded-2xl border border-border space-y-3">
                        <input
                          type="text"
                          placeholder={t("basket.cardNumber")}
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground"
                          maxLength={16}
                        />
                        <div className="flex gap-3">
                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={expiry}
                            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                            className="flex-1 px-4 py-3 rounded-xl bg-background border border-border text-foreground"
                            maxLength={5}
                          />
                          <input
                            type="text"
                            placeholder="CVC"
                            value={cvc}
                            onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            className="w-24 px-4 py-3 rounded-xl bg-background border border-border text-foreground"
                            maxLength={4}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setAddingCard(false)}
                            className="flex-1 py-3 rounded-xl bg-secondary text-foreground font-medium"
                          >
                            {t("general.cancel")}
                          </button>
                          <button
                            onClick={handleAddCard}
                            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium"
                          >
                            {t("basket.addCard")}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingCard(true)}
                        className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-dashed border-border text-muted-foreground hover:bg-secondary/50"
                      >
                        <Plus className="h-5 w-5" />
                        {t("basket.addNewCard")}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border px-5 py-4 pb-safe flex-shrink-0">
                <button
                  onClick={handlePurchase}
                  disabled={processing || !selectedCardId}
                  className="w-full rounded-2xl bg-primary py-4 font-semibold text-primary-foreground shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processing && <Loader2 className="h-5 w-5 animate-spin" />}
                  {processing ? t("basket.processing") : `${t("basket.pay")} ${formatPrice(total)}`}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
}

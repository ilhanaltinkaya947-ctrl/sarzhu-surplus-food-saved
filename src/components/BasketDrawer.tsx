import { useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { X, Trash2, CreditCard, Plus, ShoppingBag, Check, Loader2, ChevronRight } from "lucide-react";
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
  return new Intl.NumberFormat("ru-KZ", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(price);
};

// Format card number with spaces for display
const formatCardDisplay = (value: string) => {
  const v = value.replace(/\D/g, "").slice(0, 16);
  const parts = [];
  for (let i = 0; i < v.length; i += 4) {
    parts.push(v.slice(i, i + 4));
  }
  return parts.join(" ");
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
  const [step, setStep] = useState<"items" | "payment">("items");

  const total = getTotal() + (items.length > 0 ? SERVICE_FEE : 0);

  const handleClose = () => {
    onOpenChange(false);
    // Reset to items step when closing
    setTimeout(() => {
      setStep("items");
      setAddingCard(false);
    }, 300);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 500) {
      handleClose();
    }
  };

  const handleAddCard = () => {
    const cleanNumber = cardNumber.replace(/\s/g, "");
    if (cleanNumber.length < 16 || expiry.length < 5 || cvc.length < 3) {
      toast.error(t("basket.invalidCard"));
      return;
    }

    const [month, year] = expiry.split("/");
    addCard({
      last4: cleanNumber.slice(-4),
      brand: cleanNumber.startsWith("4") ? "Visa" : cleanNumber.startsWith("5") ? "Mastercard" : "Card",
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

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 16);
    setCardNumber(formatCardDisplay(value));
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, "").slice(0, 4);
    if (v.length >= 2) {
      return v.slice(0, 2) + "/" + v.slice(2);
    }
    return v;
  };

  const goToPayment = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    setStep("payment");
  };

  const getCardIcon = (brand: string) => {
    return brand === "Visa" ? "💳" : brand === "Mastercard" ? "💳" : "💳";
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
              <div className="flex items-center gap-3">
                {step === "payment" && (
                  <button 
                    onClick={() => setStep("items")}
                    className="p-2 -ml-2 rounded-full hover:bg-secondary"
                  >
                    <ChevronRight className="h-5 w-5 rotate-180" />
                  </button>
                )}
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  {step === "items" ? t("basket.title") : t("basket.paymentMethod")}
                </h2>
              </div>
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
              ) : step === "items" ? (
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
                </>
              ) : (
                <>
                  {/* Payment Step */}
                  <div className="space-y-3">
                    {/* Saved Cards */}
                    {savedCards.map((card) => (
                      <button
                        key={card.id}
                        onClick={() => selectCard(card.id)}
                        className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                          selectedCardId === card.id
                            ? "border-primary bg-primary/5"
                            : "border-border bg-secondary/30"
                        }`}
                      >
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-lg">
                          {getCardIcon(card.brand)}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-foreground">{card.brand} •••• {card.last4}</p>
                          <p className="text-xs text-muted-foreground">
                            {t("basket.expires")} {String(card.expiryMonth).padStart(2, '0')}/{String(card.expiryYear).slice(-2)}
                          </p>
                        </div>
                        {selectedCardId === card.id && (
                          <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-4 w-4 text-primary-foreground" />
                          </div>
                        )}
                      </button>
                    ))}

                    {/* Add New Card Form */}
                    {addingCard ? (
                      <div className="p-4 rounded-2xl border-2 border-primary/20 bg-card space-y-4">
                        <p className="text-sm font-medium text-foreground">{t("basket.addNewCard")}</p>
                        
                        {/* Card Number */}
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground">{t("basket.cardNumber")}</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="0000 0000 0000 0000"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            className="w-full px-4 py-3.5 rounded-xl bg-secondary border-0 text-foreground text-lg tracking-wider font-mono placeholder:text-muted-foreground/50"
                            maxLength={19}
                          />
                        </div>
                        
                        {/* Expiry & CVC */}
                        <div className="flex gap-3">
                          <div className="flex-1 space-y-1.5">
                            <label className="text-xs text-muted-foreground">{t("basket.expiry")}</label>
                            <input
                              type="text"
                              inputMode="numeric"
                              placeholder="MM/YY"
                              value={expiry}
                              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                              className="w-full px-4 py-3.5 rounded-xl bg-secondary border-0 text-foreground text-center font-mono placeholder:text-muted-foreground/50"
                              maxLength={5}
                            />
                          </div>
                          <div className="w-24 space-y-1.5">
                            <label className="text-xs text-muted-foreground">CVC</label>
                            <input
                              type="text"
                              inputMode="numeric"
                              placeholder="•••"
                              value={cvc}
                              onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                              className="w-full px-4 py-3.5 rounded-xl bg-secondary border-0 text-foreground text-center font-mono placeholder:text-muted-foreground/50"
                              maxLength={4}
                            />
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => {
                              setAddingCard(false);
                              setCardNumber("");
                              setExpiry("");
                              setCvc("");
                            }}
                            className="flex-1 py-3 rounded-xl bg-secondary text-foreground font-medium"
                          >
                            {t("general.cancel")}
                          </button>
                          <button
                            onClick={handleAddCard}
                            className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold"
                          >
                            {t("basket.saveCard")}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingCard(true)}
                        className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-border text-muted-foreground hover:bg-secondary/50 hover:border-primary/30 transition-all"
                      >
                        <Plus className="h-5 w-5" />
                        {t("basket.addNewCard")}
                      </button>
                    )}
                  </div>

                  {/* Order Summary */}
                  <div className="rounded-2xl bg-muted/50 p-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{t("shop.total")}</span>
                      <span className="font-bold text-primary text-xl">{formatPrice(total)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-border px-5 py-4 pb-safe flex-shrink-0">
                {step === "items" ? (
                  <button
                    onClick={goToPayment}
                    className="w-full rounded-2xl bg-primary py-4 font-semibold text-primary-foreground shadow-lg flex items-center justify-center gap-2"
                  >
                    <CreditCard className="h-5 w-5" />
                    {t("basket.proceedToPayment")}
                    <ChevronRight className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    onClick={handlePurchase}
                    disabled={processing || !selectedCardId}
                    className="w-full rounded-2xl bg-primary py-4 font-semibold text-primary-foreground shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing && <Loader2 className="h-5 w-5 animate-spin" />}
                    {processing ? t("basket.processing") : `${t("basket.pay")} ${formatPrice(total)}`}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
}

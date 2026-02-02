import { useState } from "react";
import { Mail, Lock, Loader2, CheckCircle, PartyPopper } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AuthModal({ open, onOpenChange, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { t } = useLanguage();

  const triggerSuccessAnimation = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6, x: 0.5 },
      colors: ['#FFB800', '#10B981', '#3B82F6', '#EC4899'],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success(t("auth.successLogin"));
        onOpenChange(false);
        onSuccess?.();
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        
        // Show success animation for sign up
        setShowSuccess(true);
        triggerSuccessAnimation();
        
        // Auto close after animation
        setTimeout(() => {
          setShowSuccess(false);
          onOpenChange(false);
          onSuccess?.();
        }, 2500);
      }
    } catch (error: any) {
      toast.error(error.message || t("general.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/15"
              >
                <PartyPopper className="h-10 w-10 text-primary" />
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-foreground mb-2"
              >
                {t("auth.welcomeNewUser")}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground"
              >
                {t("auth.accountCreated")}
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 flex items-center justify-center gap-2 text-primary"
              >
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">{t("auth.successSignup")}</span>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-center">
                    {isLogin ? t("auth.welcomeBack") : t("auth.createAccount")}
                  </DialogTitle>
                  <p className="text-center text-muted-foreground text-sm mt-2">
                    {isLogin
                      ? t("auth.signInSubtitle")
                      : t("auth.signUpSubtitle")}
                  </p>
                </DialogHeader>
              </div>

              <div className="p-6 space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        type="email"
                        placeholder={t("auth.email")}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        type="password"
                        placeholder={t("auth.password")}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground shadow-lg transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isLogin ? t("auth.signIn") : t("auth.signUp")}
                  </button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                  {isLogin ? t("auth.noAccount") + " " : t("auth.hasAccount") + " "}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="font-medium text-primary hover:underline"
                  >
                    {isLogin ? t("auth.signUpLink") : t("auth.signInLink")}
                  </button>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

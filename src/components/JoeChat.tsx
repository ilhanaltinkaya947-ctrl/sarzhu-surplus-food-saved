import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTier } from "@/contexts/TierContext";

interface Message {
  id: string;
  text: string;
  isJoe: boolean;
  timestamp: Date;
}

interface JoeChatProps {
  open: boolean;
  onClose: () => void;
}

// Consistent Joe personality across all tiers
const CHAT_CONFIG = {
  title: "Joe the Food Rescue Pup",
  subtitle: "Powered by AI 🐾",
  greeting: "Woof! 🐶 I'm Joe, your Food Rescue Pup. I sniff out the best surplus food deals in Almaty. What are you craving today?",
  placeholder: "Ask Joe about deals...",
  fallback: "Woof! I'm having trouble sniffing right now. Try asking me again! 🐾",
  errorFallback: "Woof! Something went wrong. Try again! 🐕",
};

export function JoeChat({ open, onClose }: JoeChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { currentTier } = useTier();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Joe greeting when chat opens
  useEffect(() => {
    if (open && messages.length === 0) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setMessages([{
          id: "greeting",
          text: CHAT_CONFIG.greeting,
          isJoe: true,
          timestamp: new Date(),
        }]);
        setIsTyping(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [open, messages.length]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputValue,
      isJoe: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages
        .filter(m => m.id !== "greeting")
        .map(m => ({
          role: m.isJoe ? "assistant" : "user",
          content: m.text,
        }));

      const { data, error } = await supabase.functions.invoke("joe-chat", {
        body: {
          message: userMessage.text,
          conversationHistory,
          tierName: currentTier.displayName, // Pass tier for context
        },
      });

      if (error) throw error;

      const joeResponse: Message = {
        id: `joe-${Date.now()}`,
        text: data.response || CHAT_CONFIG.errorFallback,
        isJoe: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, joeResponse]);
    } catch (error) {
      console.error("Error calling chat:", error);
      
      // Fallback response
      const fallbackResponse: Message = {
        id: `joe-${Date.now()}`,
        text: CHAT_CONFIG.fallback,
        isJoe: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, fallbackResponse]);
      toast.error("Joe is temporarily unavailable");
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={onClose}
          />

          {/* Chat Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-4 left-4 right-4 z-[70] max-w-md mx-auto bg-background rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: "70dvh" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
              <div className="flex items-center gap-3">
                <img 
                  src={currentTier.mascotImage} 
                  alt="Joe" 
                  className="h-10 w-10 rounded-full object-cover shadow-inner"
                />
                <div>
                  <h3 className="font-bold text-sm">{CHAT_CONFIG.title}</h3>
                  <p className="text-xs opacity-80">{CHAT_CONFIG.subtitle}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-full hover:bg-primary-foreground/10 text-primary-foreground"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.isJoe ? "justify-start" : "justify-end"}`}
                >
                  {msg.isJoe && (
                    <img 
                      src={currentTier.mascotImage} 
                      alt="Joe" 
                      className="h-8 w-8 rounded-full object-cover mr-2 flex-shrink-0 shadow-sm"
                    />
                  )}
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                      msg.isJoe
                        ? "bg-primary text-primary-foreground rounded-tl-sm"
                        : "bg-secondary text-secondary-foreground rounded-tr-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <img 
                    src={currentTier.mascotImage} 
                    alt="Joe" 
                    className="h-8 w-8 rounded-full object-cover shadow-sm"
                  />
                  <div className="bg-primary px-4 py-2.5 rounded-2xl rounded-tl-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-primary-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-primary-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-primary-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div className="p-3 bg-background border-t border-border">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={CHAT_CONFIG.placeholder}
                  disabled={isTyping}
                  className="flex-1 rounded-full bg-muted border-0 focus-visible:ring-primary"
                />
                <Button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                  className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground p-0"
                >
                  {isTyping ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

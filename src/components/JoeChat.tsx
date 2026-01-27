import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

const JOE_RESPONSES: Record<string, string> = {
  bakery: "I smell fresh pastries at Panfilov Bakery! They have 3 Mystery Bags left. 🥐",
  bread: "I smell fresh pastries at Panfilov Bakery! They have 3 Mystery Bags left. 🥐",
  coffee: "Woof! Coffee Boom on Dostyk has amazing surplus coffee and treats! ☕",
  sushi: "I found some sushi spots! Check Sushi Master - they often have evening deals. 🍣",
  pizza: "Pizza Palace has mystery bags after 8 PM! My tail is wagging! 🍕",
  cheap: "The best deals are usually after 6 PM. Set a reminder and I'll help you hunt! 💰",
  help: "I can help you find: 🥐 Bakeries, ☕ Coffee shops, 🍣 Sushi, 🍕 Pizza, and more! Just tell me what you're craving!",
};

const getJoeResponse = (userMessage: string): string => {
  const lowerMessage = userMessage.toLowerCase();
  
  for (const [keyword, response] of Object.entries(JOE_RESPONSES)) {
    if (lowerMessage.includes(keyword)) {
      return response;
    }
  }
  
  return "Yum! Let me check my map... 🗺️ Try using the filters above, or ask me about bakeries, coffee, sushi, or pizza!";
};

export function JoeChat({ open, onClose }: JoeChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Joe's greeting when chat opens
  useEffect(() => {
    if (open && messages.length === 0) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setMessages([{
          id: "greeting",
          text: "Woof! 🐶 I'm Joe, your Food Rescue Pup. I sniff out the best surplus food deals in Almaty. What are you craving today?",
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

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputValue,
      isJoe: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Joe responds after a delay
    setTimeout(() => {
      const joeResponse: Message = {
        id: `joe-${Date.now()}`,
        text: getJoeResponse(userMessage.text),
        isJoe: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, joeResponse]);
      setIsTyping(false);
    }, 800 + Math.random() * 500);
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
            <div className="flex items-center justify-between px-4 py-3 bg-[#FFB800] text-black">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-xl shadow-inner">
                  🐕
                </div>
                <div>
                  <h3 className="font-bold text-sm">Joe the Food Rescue Pup</h3>
                  <p className="text-xs opacity-80">Always sniffing for deals 🐾</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-full hover:bg-black/10"
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
                    <div className="h-8 w-8 rounded-full bg-[#FFB800] flex items-center justify-center text-sm mr-2 flex-shrink-0 shadow-sm">
                      🐕
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                      msg.isJoe
                        ? "bg-[#FFB800] text-black rounded-tl-sm"
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
                  <div className="h-8 w-8 rounded-full bg-[#FFB800] flex items-center justify-center text-sm shadow-sm">
                    🐕
                  </div>
                  <div className="bg-[#FFB800] px-4 py-2.5 rounded-2xl rounded-tl-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-black/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-black/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-black/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
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
                  placeholder="Ask Joe..."
                  className="flex-1 rounded-full bg-muted border-0 focus-visible:ring-[#FFB800]"
                />
                <Button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="h-10 w-10 rounded-full bg-[#FFB800] hover:bg-[#E5A600] text-black p-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

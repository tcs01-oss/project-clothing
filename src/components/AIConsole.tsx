import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, X, ShoppingBag, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CartItem } from "../types";

interface AIConsoleProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  activeProductId?: string | null;
  onSelectSuggestion?: (prompt: string) => void;
}

interface Message {
  sender: "user" | "bot";
  text: string;
  time: string;
}

export default function AIConsole({ isOpen, onClose, cartItems, activeProductId, onSelectSuggestion }: AIConsoleProps) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "🌿 **Greetings, Wanderer!** I am your vartman Styling Scribe and Explorer Advisor. Name your upcoming travel destination (whether it's the rainy forests, sunny sand dunes, or cold coastal cliffs), and I will coordinate a custom organic wardrobe packing list and share the stories behind our creations!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const prompt = textToSend || query;
    if (!prompt.trim()) return;

    const userMsg: Message = {
      sender: "user",
      text: prompt,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setQuery("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: prompt,
          cartItems,
          currentProductId: activeProductId
        })
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Received an invalid response from the server. The server might be restarting or offline. Please try again in a few moments.");
      }

      const data = await res.json();
      const botMsg: Message = {
        sender: "bot",
        text: data.text || "I apologize, my explorer senses experienced a momentary disconnect. Let's return to the trail.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        sender: "bot",
        text: "Could not establish server-side AI connection. Please verify your endpoints and key values.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const starterSuggestions = [
    "Packing list for a high-altitude mountain climb?",
    "Tell me the traveler story behind the Dune t-shirt.",
    "Which items are styled in deep forest green or sand beige?",
    "Help me outfit accessories that coordinate with my active cart."
  ];

  const formatText = (text: string) => {
    const segments = text.split(/(\*\*.*?\*\*)/g);
    return segments.map((seg, idx) => {
      if (seg.startsWith("**") && seg.endsWith("**")) {
        return <strong key={idx} className="font-semibold text-linen">{seg.slice(2, -2)}</strong>;
      }
      return seg;
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-[140] cursor-pointer"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-ink border-l border-sand/20 shadow-2xl z-[150] flex flex-col font-sans"
          >
            {/* Header */}
            <div className="p-4 border-b border-sand/10 bg-ink flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded bg-moss/10 border border-moss/20">
                  <Sparkles className="w-5 h-5 text-moss" />
                </div>
                <div>
                  <h3 className="font-medium text-linen" id="ai-chat-title">vartman Explorer Advisor</h3>
                  <div className="flex items-center gap-1.5 text-xs text-linen/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-moss animate-pulse" />
                    <span>Gemini 3.5 Active</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-sand/15 rounded text-linen/40 hover:text-white transition"
                id="ai-console-close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Active Product/Cart Context Indicators */}
            {(cartItems.length > 0 || activeProductId) && (
              <div className="px-4 py-2.5 bg-ink border-b border-sand/20 text-xs text-linen/40 flex items-center gap-3 overflow-x-auto whitespace-nowrap">
                <span className="text-linen/50 uppercase tracking-wider font-semibold">Active Trails:</span>
                {cartItems.length > 0 && (
                  <div className="flex items-center gap-1 bg-moss/10 border border-moss/10 px-2.5 py-0.5 rounded text-moss">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Selected ({cartItems.length})</span>
                  </div>
                )}
                {activeProductId && (
                  <div className="flex items-center gap-1 bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded text-sky-450">
                    <span>Checking Design Story</span>
                  </div>
                )}
              </div>
            )}

            {/* Chat Body */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-sand/20 bg-ink"
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-moss border border-moss-hover text-white rounded-tr-none"
                        : "bg-ink/60 border border-sand/20 text-linen/80 rounded-tl-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{formatText(msg.text)}</p>
                    <span className="block mt-1.5 text-[10px] text-right opacity-60">
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-ink/65 border border-sand/20 rounded-lg p-3 rounded-tl-none flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-moss animate-bounce delay-75" />
                      <div className="w-1.5 h-1.5 rounded-full bg-moss animate-bounce delay-150" />
                      <div className="w-1.5 h-1.5 rounded-full bg-moss animate-bounce delay-300" />
                    </div>
                    <span className="text-xs text-linen/50 font-mono select-none">Fusing traveler stories...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions Shelf */}
            {messages.length === 1 && (
              <div className="p-4 border-t border-sand/20 bg-ink space-y-2">
                <span className="text-xs text-linen/50 font-medium">Recommended trails:</span>
                <div className="grid grid-cols-1 gap-1.5">
                  {starterSuggestions.map((sugar, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(sugar)}
                      className="text-left text-xs bg-ink/60 hover:bg-ink border border-sand/10 hover:border-sand/30 p-2 rounded text-linen/40 hover:text-linen/80 transition flex items-center justify-between group"
                    >
                      <span className="truncate pr-2">{sugar}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-linen/40 group-hover:text-moss transition flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Footer */}
            <div className="p-4 border-t border-sand/20 bg-ink">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Where is your next escape..."
                  className="flex-1 bg-ink border border-sand/10 rounded px-3 py-2 text-sm text-linen/90 placeholder-stone-500 focus:outline-none focus:border-moss transition"
                  id="ai-console-input"
                />
                <button
                  type="submit"
                  disabled={!query.trim() || loading}
                  className="p-2.5 bg-moss hover:bg-moss-hover disabled:opacity-50 disabled:hover:bg-moss-hover text-linen font-semibold rounded transition"
                  id="ai-console-send-btn"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
              <div className="mt-2 text-center text-[10px] text-linen/40 font-mono">
                Cross-references organic compositions & low-impact materials
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

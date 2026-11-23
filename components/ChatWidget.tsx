'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, Send, X, Trash2, ChevronDown, RefreshCw, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api, errorText } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  {
    icon: '🚨',
    label: 'Restock Alerts',
    query: 'What items should I restock right now?',
  },
  {
    icon: '📊',
    label: 'Sales Summary',
    query: 'Give me a summary of our sales performance',
  },
  {
    icon: '🛍️',
    label: 'Combo Promos',
    query: 'Suggest a combo promotion for slow movers',
  },
  {
    icon: '📈',
    label: '14-Day Forecast',
    query: 'Explain our 14-day revenue forecast',
  },
];

export function ChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem('stockify_copilot_chat');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return [
      {
        id: 'welcome',
        role: 'model',
        text: '👋 **Hello! I am your Stockify AI Copilot powered by Google Gemini.**\n\nI have live visibility into your store inventory, 14-day sales forecasts, and customer trends. Ask me anything about stock, restock planning, or promotion ideas!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [input, setInput] = useState('');
  const [showPrompts, setShowPrompts] = useState(true);
  const [loading, setLoading] = useState(false);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('stockify_copilot_chat', JSON.stringify(messages));
      } catch {}
    }
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend ?? input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Prepare history payload for multi-turn conversational context
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await api<{ reply: string; hasKey: boolean }>('/ai/chat', {
        method: 'POST',
        body: {
          message: query,
          history: historyPayload,
        },
      });

      setHasKey(res.hasKey);

      const botMsg: ChatMessage = {
        id: `m-${Date.now()}`,
        role: 'model',
        text: res.reply || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: `e-${Date.now()}`,
        role: 'model',
        text: `⚠️ **Error communicating with Copilot:** ${errorText(err)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'reset',
        role: 'model',
        text: '🧹 **Chat cleared.** How else can I help you optimize your store operations today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const renderInline = (text: string) => {
    // Split by **bold** text patterns safely without dangerouslySetInnerHTML
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const renderFormatted = (content: string) => {
    // Process markdown line by line
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();

      // Bullets
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const bulletText = trimmed.slice(2);
        return (
          <li
            key={idx}
            className="ml-4 list-disc text-xs sm:text-sm leading-relaxed"
          >
            {renderInline(bulletText)}
          </li>
        );
      }

      // Headers
      if (trimmed.startsWith('### ')) {
        return (
          <h4
            key={idx}
            className="font-bold text-xs sm:text-sm mt-2 mb-1"
          >
            {renderInline(trimmed.slice(4))}
          </h4>
        );
      }

      // Empty line spacer
      if (!trimmed) {
        return <div key={idx} className="h-1.5" />;
      }

      return (
        <p
          key={idx}
          className="text-xs sm:text-sm leading-relaxed"
        >
          {renderInline(line)}
        </p>
      );
    });
  };

  if (user?.role !== 'owner') {
    return null;
  }

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 px-4 py-3 text-white shadow-xl shadow-indigo-500/25 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/40 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
          aria-label="Open AI Copilot"
        >
          <div className="relative">
            <Bot className="size-5 transition-transform duration-300 group-hover:rotate-12" />
            <span className="absolute -top-1 -right-1 flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex size-2.5 rounded-full bg-amber-400"></span>
            </span>
          </div>
          <span className="text-sm font-semibold tracking-tight hidden sm:inline">Ask AI Copilot</span>
          <Sparkles className="size-3.5 text-amber-300 animate-pulse" />
        </button>
      )}

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div
          data-lenis-prevent
          data-lenis-prevent-wheel
          data-lenis-prevent-touch
          className="fixed bottom-5 right-5 z-50 flex flex-col w-[94vw] sm:w-[420px] h-[580px] max-h-[85vh] rounded-2xl border border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl shadow-black/25 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3 bg-gradient-to-r from-violet-600/10 via-indigo-600/10 to-blue-600/10">
            <div className="flex items-center gap-2.5">
              <div className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-sm">
                <Bot className="size-5" />
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold tracking-tight text-foreground">Stockify Copilot</h3>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-semibold">
                    Gemini AI
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">Store Assistant • Live Inventory</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                onClick={handleClear}
                title="Clear chat"
              >
                <Trash2 className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 rounded-lg text-muted-foreground hover:text-foreground"
                onClick={() => setIsOpen(false)}
                title="Close"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          {/* Quick Prompt Grid - Fully Visible 2-Column Layout */}
          <div className="border-b bg-muted/20 px-3 py-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <Sparkles className="size-3 text-indigo-500" />
                Suggested Inquiries
              </span>
              <button
                type="button"
                onClick={() => setShowPrompts((v) => !v)}
                className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5 cursor-pointer font-medium"
              >
                {showPrompts ? 'Hide' : 'Show'}
                <ChevronDown className={`size-3 transition-transform duration-200 ${showPrompts ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {showPrompts && (
              <div className="grid grid-cols-2 gap-1.5 animate-in fade-in duration-150">
                {QUICK_PROMPTS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(item.query)}
                    disabled={loading}
                    className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-background/90 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-400/50 px-2.5 py-2 text-left text-xs font-medium text-foreground transition-all shadow-xs active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  >
                    <span className="text-sm shrink-0">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Messages Container with explicit Lenis isolation and custom scrollbar */}
          <div
            ref={scrollRef}
            data-lenis-prevent
            data-lenis-prevent-wheel
            data-lenis-prevent-touch
            onWheel={(e) => e.stopPropagation()}
            className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-3.5 text-sm custom-scrollbar"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {!isUser && (
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white text-xs mt-0.5">
                      <Bot className="size-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-sm text-xs sm:text-sm ${
                      isUser
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-xs'
                        : 'bg-muted/60 dark:bg-muted/40 border border-border/50 text-foreground rounded-tl-xs space-y-1'
                    }`}
                  >
                    {isUser ? (
                      <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                    ) : (
                      renderFormatted(m.text)
                    )}
                    <span
                      className={`block text-[10px] mt-1 text-right ${
                        isUser ? 'text-white/70' : 'text-muted-foreground'
                      }`}
                    >
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start gap-2.5">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white text-xs mt-0.5">
                  <Bot className="size-4" />
                </div>
                <div className="rounded-2xl rounded-tl-xs border border-border/50 bg-muted/60 dark:bg-muted/40 px-4 py-3 text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                  <RefreshCw className="size-3.5 animate-spin text-indigo-500" />
                  <span>Stockify Copilot is thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 border-t p-3 bg-background/90"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about inventory, restock, sales..."
              disabled={loading}
              className="flex-1 bg-muted/50 border border-border/70 rounded-xl px-3.5 py-2 text-xs sm:text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all disabled:opacity-50"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || loading}
              className="size-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shrink-0 shadow-sm disabled:opacity-40"
            >
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, User, ChevronRight, ChevronLeft, Sparkles, X } from 'lucide-react';
import { Button } from '../common/Button';
import { cn } from '../../utils/cn';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface IntelligenceAgentProps {
  messages: Message[];
  onSendMessage: (msg: string) => void;
  isLoading?: boolean;
}

export const IntelligenceAgent: React.FC<IntelligenceAgentProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading 
}) => {
  const [expanded, setExpanded] = useState(true);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className={cn(
      "h-full border-l border-border bg-white transition-all duration-500 relative flex flex-col shadow-2xl z-10",
      expanded ? "w-[450px]" : "w-20"
    )}>
      {/* Toggle Button */}
      <button 
        onClick={() => setExpanded(!expanded)}
        className="absolute -left-4 top-10 w-8 h-8 rounded-full bg-white border border-border shadow-md flex items-center justify-center text-muted-foreground hover:text-primary transition-colors z-20"
      >
        {expanded ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Header */}
      <div className={cn("p-8 border-b border-border flex items-center shrink-0", !expanded && "justify-center p-6")}>
        <div className={cn("p-2.5 bg-primary/10 rounded-2xl flex items-center justify-center text-primary", !expanded && "mx-auto")}>
          <Brain size={expanded ? 20 : 24} />
        </div>
        {expanded && (
          <div className="ml-4">
            <h3 className="font-bold text-sm tracking-tight">Hindsight Core</h3>
            <div className="flex items-center space-x-2 text-[10px] font-bold text-green-600 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>Real-time Synthesis</span>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {expanded ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col min-h-0"
          >
            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex flex-col", m.role === 'user' ? "items-end" : "items-start")}>
                  <div className={cn(
                    "max-w-[85%] p-5 rounded-3xl text-sm leading-relaxed",
                    m.role === 'user' 
                      ? "bg-primary text-white" 
                      : "bg-secondary/40 text-foreground border border-border"
                  )}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <div className="p-2 bg-secondary rounded-lg">
                    <Sparkles size={14} className="animate-spin" />
                  </div>
                  <span className="text-xs font-medium italic">Synthesizing memory...</span>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-8 border-t border-border bg-secondary/10">
              <form onSubmit={handleSubmit} className="flex items-center space-x-3 bg-white p-2 pl-5 rounded-2xl border border-border shadow-sm focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Hindsight about this contact..." 
                  className="flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-muted-foreground/50"
                  disabled={isLoading}
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        ) : (
          <div className="flex-1 flex flex-col items-center pt-10 space-y-8">
            <div className="w-1 h-20 bg-secondary rounded-full" />
            <div className="rotate-90 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em] whitespace-nowrap">
              Intelligence Active
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Bot, User, HelpCircle, Loader2 } from 'lucide-react';
import type { Asana, AIChatMessage } from '../types';
import { askAIYogaTeacher } from '../services/api';

interface AIYogaTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  asana?: Asana;
}

export const AIYogaTeacherModal: React.FC<AIYogaTeacherModalProps> = ({
  isOpen,
  onClose,
  asana,
}) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: asana
        ? `Namaste. I am your Pragya Yog Verse AI Teacher and anatomical guide. We are currently exploring **${asana.englishName}** (${asana.sanskritName}). What would you like to understand about your alignment, muscle engagement, or breath synchronicity?`
        : `Namaste. I am your Pragya Yog Verse AI Teacher and biomechanist. Ask me anything about yoga postures, biomechanics, chakra flows, or breathing techniques.`,
      timestamp: Date.now(),
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    'How do I protect my lower back in this pose?',
    'What are the primary muscles working here?',
    'What is the ideal breath cue for entering?',
    'How can I modify this if I have tight hips?',
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: AIChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryText) setInputQuery('');
    setIsLoading(true);

    try {
      const res = await askAIYogaTeacher(textToSend, asana?.slug);
      const assistantMessage: AIChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: res.answer,
        timestamp: Date.now(),
        degraded: res.degraded,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      if (res.suggestedQuestions && res.suggestedQuestions.length > 0) {
        setSuggestedQuestions(res.suggestedQuestions);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: 'Let your breath be your anchor. Reconnect to your physical foundation, align your spine with gentle awareness, and breathe into any areas of tension.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl h-[640px] rounded-3xl bg-[#F5EFE5] dark:bg-[#061e13] border border-[#00381F]/20 dark:border-[#D9AE29]/30 shadow-2xl flex flex-col overflow-hidden text-[#272727] dark:text-[#F5EFE5]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-black/10 dark:border-white/10 flex items-center justify-between bg-white/60 dark:bg-[#00381F]/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#944426] dark:bg-[#D9AE29] flex items-center justify-center text-white dark:text-[#00381F] shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="font-display font-bold text-base text-[#00381F] dark:text-[#F5EFE5]">
                AI YOGA TEACHER & BIOMECHANIST
              </div>
              <div className="text-[11px] font-mono text-stone-500 dark:text-stone-400">
                Powered by Gemini 3.7 &bull; {asana?.englishName || 'Yoga Wisdom'}
              </div>
            </div>
          </div>

          <button
            id="close-ai-modal-btn"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#944426]/20 dark:bg-[#D9AE29]/20 flex items-center justify-center text-[#944426] dark:text-[#D9AE29] shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-[#00381F] text-[#F5EFE5] dark:bg-[#D9AE29] dark:text-[#00381F] font-medium rounded-tr-none'
                      : 'bg-white/80 dark:bg-black/40 border border-black/5 dark:border-white/10 text-[#272727] dark:text-[#F5EFE5] rounded-tl-none shadow-sm'
                  }`}
                >
                  {msg.content}

                  {msg.degraded && (
                    <div className="mt-3 pt-2.5 border-t border-amber-500/30 flex items-start gap-1.5 text-[10px] font-mono text-amber-700 dark:text-amber-400/90 not-italic">
                      <HelpCircle className="w-3 h-3 shrink-0 mt-px" />
                      <span>
                        General guidance — the AI teacher is unavailable right now, so this
                        is not a generated answer.
                      </span>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#00381F]/20 dark:bg-[#D9AE29]/20 flex items-center justify-center text-[#00381F] dark:text-[#D9AE29] shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center text-xs text-stone-500 font-mono">
              <div className="w-8 h-8 rounded-full bg-[#944426]/20 dark:bg-[#D9AE29]/20 flex items-center justify-center text-[#944426] dark:text-[#D9AE29]">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <span>Consulting anatomical wisdom & kinesiology...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Suggested Quick Question Chips */}
        {suggestedQuestions.length > 0 && (
          <div className="px-4 py-2 bg-black/5 dark:bg-black/20 flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#944426] dark:text-[#D9AE29] shrink-0 font-bold">
              Suggested:
            </span>
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                id={`suggested-q-${idx}`}
                onClick={() => handleSend(q)}
                className="text-[11px] px-3 py-1 rounded-full bg-white/70 dark:bg-white/10 hover:bg-[#944426] hover:text-white dark:hover:bg-[#D9AE29] dark:hover:text-[#00381F] whitespace-nowrap transition-all border border-black/5"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Chat Input Bar */}
        <div className="p-4 border-t border-black/10 dark:border-white/10 bg-white/60 dark:bg-[#00381F]/50 backdrop-blur-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              id="ai-teacher-input"
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about adjustments, muscle engagement, or contraindications..."
              className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-black/50 border border-[#00381F]/20 dark:border-white/15 focus:outline-none focus:ring-2 focus:ring-[#944426] dark:focus:ring-[#D9AE29] text-xs sm:text-sm text-[#272727] dark:text-[#F5EFE5] placeholder:text-stone-400"
            />
            <button
              id="ai-teacher-send-btn"
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="px-4 py-3 rounded-xl bg-[#00381F] text-[#F5EFE5] dark:bg-[#D9AE29] dark:text-[#00381F] hover:scale-105 transition-transform disabled:opacity-40 disabled:hover:scale-100 flex items-center justify-center font-bold"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-[10px] text-center text-stone-500 mt-2">
            Guidance is educational. Always listen to your body and consult your healthcare provider.
          </div>
        </div>
      </div>
    </div>
  );
};

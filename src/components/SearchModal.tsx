import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight, Sparkles, Activity, Shield } from 'lucide-react';
import { ASANAS } from '../data/asanas';
import { Asana } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAsana: (asana: Asana) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectAsana,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // toggle modal
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = ASANAS.filter((a) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      a.englishName.toLowerCase().includes(q) ||
      a.sanskritName.toLowerCase().includes(q) ||
      a.meaning.toLowerCase().includes(q) ||
      a.muscles.some((m) => m.name.toLowerCase().includes(q)) ||
      a.chakras.some((c) => c.sanskritName.toLowerCase().includes(q)) ||
      a.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#F5EFE5] dark:bg-[#071912] border border-[#00381F]/20 dark:border-[#D9AE29]/30 shadow-2xl overflow-hidden text-[#272727] dark:text-[#F5EFE5]">
        
        {/* Search Header */}
        <div className="p-4 sm:p-5 border-b border-black/10 dark:border-white/10 flex items-center gap-3 bg-white/60 dark:bg-[#00381F]/40 backdrop-blur-md">
          <Search className="w-5 h-5 text-[#944426] dark:text-[#D9AE29]" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Quick search asanas, Sanskrit names, kinesiology..."
            className="flex-1 bg-transparent border-none focus:outline-none text-xs sm:text-sm text-[#272727] dark:text-[#F5EFE5] placeholder:text-stone-400"
          />
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-stone-500 dark:text-stone-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-1.5">
          {filtered.map((asana) => (
            <button
              key={asana.id}
              onClick={() => {
                onSelectAsana(asana);
                onClose();
              }}
              className="w-full text-left p-3 rounded-2xl hover:bg-white/80 dark:hover:bg-[#092219] transition-colors flex items-center justify-between group border border-transparent hover:border-black/5 dark:hover:border-white/10"
            >
              <div className="flex items-center gap-3">
                {asana.imageUrl && (
                  <img
                    src={asana.imageUrl}
                    alt={asana.englishName}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                    className="w-11 h-11 rounded-xl object-cover border border-black/10 dark:border-white/10 shrink-0"
                  />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm text-[#00381F] dark:text-[#F5EFE5] group-hover:text-[#944426] dark:group-hover:text-[#D9AE29]">
                      {asana.englishName}
                    </span>
                    <span className="text-xs font-accent italic text-[#944426] dark:text-[#D9AE29]">
                      ({asana.sanskritName})
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-3 mt-1">
                    <span>{asana.category}</span>
                    <span>&bull;</span>
                    <span>{asana.difficulty}</span>
                    <span>&bull;</span>
                    <span className="truncate max-w-[180px] sm:max-w-xs">{asana.muscles.map((m) => m.name.split('(')[0]).join(', ')}</span>
                  </div>
                </div>
              </div>

              <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#944426] dark:group-hover:text-[#D9AE29] group-hover:translate-x-1 transition-all shrink-0 ml-2" />
            </button>
          ))}

          {filtered.length === 0 && (
            <div className="p-8 text-center text-xs text-stone-500">
              No matching asana found for "{query}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

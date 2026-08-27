import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Sparkles, 
  Flame, 
  Compass, 
  Check, 
  Activity, 
  Shield, 
  SlidersHorizontal 
} from 'lucide-react';
import { ASANAS } from '../../data/asanas';
import type { Asana } from '../../types';

interface PoseLibraryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentAsana: Asana;
  onSelectAsana: (asana: Asana) => void;
}

export const PoseLibraryDrawer: React.FC<PoseLibraryDrawerProps> = ({
  isOpen,
  onClose,
  currentAsana,
  onSelectAsana,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  const categories = ['All', 'Standing', 'Balance', 'Backbend', 'Inversion', 'Forward Fold', 'Restorative'];
  const difficulties = ['All', 'Easy', 'Intermediate', 'Hard'];

  const filteredAsanas = useMemo(() => {
    return ASANAS.filter((a) => {
      const matchesSearch = 
        a.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.sanskritName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCat = selectedCategory === 'All' || a.category === selectedCategory;
      const matchesDiff = selectedDifficulty === 'All' || a.difficulty === selectedDifficulty;

      return matchesSearch && matchesCat && matchesDiff;
    });
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-start bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md h-full bg-[#14110e]/95 backdrop-blur-2xl border-r border-[#c59b27]/30 shadow-2xl p-5 flex flex-col justify-between text-[#F5EFE5] animate-in slide-in-from-left duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#c59b27]/20">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#D9AE29]" />
            <h2 className="font-display text-lg font-bold text-[#F5EFE5]">
              Pragya Pose Library
            </h2>
            <span className="text-xs font-mono text-[#D9AE29] px-2 py-0.5 rounded-full bg-[#c59b27]/20">
              {filteredAsanas.length} Poses
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Library Drawer"
            className="p-1.5 rounded-full hover:bg-white/10 text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="pt-3 space-y-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posture name or Sanskrit..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/50 border border-[#c59b27]/30 text-xs text-[#F5EFE5] placeholder:text-stone-500 focus:outline-none focus:border-[#D9AE29]"
            />
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[10px] font-semibold">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg shrink-0 transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#D9AE29] text-[#0c0e12] font-bold'
                    : 'bg-black/40 text-stone-300 hover:text-white border border-[#c59b27]/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Asanas List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2 custom-scrollbar pr-1">
          {filteredAsanas.map((asana) => {
            const isSelected = currentAsana.id === asana.id;
            return (
              <div
                key={asana.id}
                onClick={() => {
                  onSelectAsana(asana);
                  onClose();
                }}
                className={`p-3 rounded-2xl transition-all cursor-pointer border flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#c59b27]/25 border-[#D9AE29] shadow-lg ring-1 ring-[#D9AE29]/40'
                    : 'bg-black/30 hover:bg-white/5 border-[#c59b27]/20 hover:border-[#D9AE29]/40'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl bg-[#c59b27]/15 border border-[#c59b27]/35 overflow-hidden flex items-center justify-center shrink-0 text-[#D9AE29] relative shadow-inner">
                    {asana.imageUrl ? (
                      <img
                        src={asana.imageUrl}
                        alt={asana.englishName}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <Sparkles className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-[#F5EFE5] text-xs sm:text-sm truncate">
                      {asana.englishName}
                    </div>
                    <div className="text-[11px] font-accent italic text-[#D9AE29] truncate">
                      {asana.sanskritName}
                    </div>
                    <div className="text-[10px] font-mono text-stone-400 mt-0.5">
                      {asana.category} &bull; {asana.difficulty}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <span className="w-6 h-6 rounded-full bg-[#D9AE29] text-[#0c0e12] flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-[#c59b27]/20 flex items-center justify-between text-[11px] font-mono text-stone-400">
          <span>Click posture to load into 3D</span>
          <button
            onClick={onClose}
            className="text-[#D9AE29] font-bold hover:underline"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

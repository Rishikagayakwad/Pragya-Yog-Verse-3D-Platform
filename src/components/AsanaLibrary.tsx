import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronDown, 
  Check, 
  Sparkles, 
  RotateCw, 
  Activity, 
  Shield, 
  SlidersHorizontal,
  X,
  Compass,
  Flame,
  Zap,
  Box
} from 'lucide-react';
import { ASANAS } from '../data/asanas';
import type { Asana, MovementType } from '../types';

interface AsanaLibraryProps {
  onSelectAsana: (asana: Asana) => void;
  isDark: boolean;
}

export const AsanaLibrary: React.FC<AsanaLibraryProps> = ({
  onSelectAsana,
  isDark,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedMovement, setSelectedMovement] = useState<string>('All');

  // Small right-side dropdown open state
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState<boolean>(false);
  const [activeFilterTab, setActiveFilterTab] = useState<'category' | 'level' | 'movement'>('category');

  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const categoryOptions = [
    { value: 'All', label: 'All Categories' },
    { value: 'Standing', label: 'Standing Postures' },
    { value: 'Balance', label: 'Balance & Equilibrium' },
    { value: 'Backbend', label: 'Backbends & Extensions' },
    { value: 'Inversion', label: 'Inversions & Lymphatic' },
    { value: 'Forward Fold', label: 'Forward Folds & Release' },
    { value: 'Restorative', label: 'Restorative & Somatic' },
  ];

  const levelOptions = [
    { value: 'All', label: 'All Levels' },
    { value: 'Easy', label: 'Beginner (Easy)' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Hard', label: 'Advanced (Hard)' },
  ];

  const movementOptions = [
    { value: 'All', label: 'All Movement Types' },
    { value: 'Strength', label: 'Strength & Isometric Power' },
    { value: 'Mobility', label: 'Articular Mobility & Range' },
    { value: 'Balance', label: 'Stabilizer Balance' },
    { value: 'Flexibility', label: 'Deep Myofascial Stretch' },
    { value: 'Restorative', label: 'Restorative Nervous Tone' },
  ];

  // Filtered Asanas without search input box
  const filteredAsanas = useMemo(() => {
    return ASANAS.filter((asana) => {
      if (selectedCategory !== 'All' && asana.category !== selectedCategory) {
        return false;
      }
      if (selectedDifficulty !== 'All' && asana.difficulty !== selectedDifficulty) {
        return false;
      }
      if (selectedMovement !== 'All' && !asana.movementTypes.includes(selectedMovement as MovementType)) {
        return false;
      }
      return true;
    });
  }, [selectedCategory, selectedDifficulty, selectedMovement]);

  const activeFilterCount = (selectedCategory !== 'All' ? 1 : 0) + 
                            (selectedDifficulty !== 'All' ? 1 : 0) + 
                            (selectedMovement !== 'All' ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedCategory('All');
    setSelectedDifficulty('All');
    setSelectedMovement('All');
  };

  const handleCardClick = (asana: Asana) => {
    onSelectAsana(asana);
  };

  return (
    <div className="min-h-screen pt-24 pb-28 px-4 sm:px-8 max-w-7xl mx-auto space-y-8 transition-colors duration-400">
      
      {/* Header Section with Right-Side Filter Dropdown */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-[#00381F]/10 dark:border-[#D9AE29]/20">
        
        {/* Left Title & Intro */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#944426]/10 dark:bg-[#D9AE29]/15 border border-[#944426]/20 dark:border-[#D9AE29]/30 text-[#944426] dark:text-[#D9AE29] text-xs uppercase tracking-widest font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Pragya Yog Verse Archive
          </div>
          
          <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-[#00381F] dark:text-[#F5EFE5]">
            THE ASANA LIBRARY
          </h1>
          
          <p className="font-accent italic text-lg sm:text-xl text-[#944426] dark:text-[#D9AE29] max-w-xl">
            Explore classical postures, anatomical layers, and biomechanical alignments.
          </p>
        </div>

        {/* Small Right-Side Filter Dropdown Control */}
        <div ref={filterDropdownRef} className="relative self-start md:self-auto shrink-0">
          <button
            id="filter-dropdown-toggle-btn"
            type="button"
            onClick={() => {
              setIsFilterDropdownOpen(!isFilterDropdownOpen);
            }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md backdrop-blur-xl border ${
              isFilterDropdownOpen || activeFilterCount > 0
                ? 'bg-[#00381F] text-[#F5EFE5] dark:bg-[#D9AE29] dark:text-[#00381F] border-[#D9AE29] shadow-lg ring-2 ring-[#D9AE29]/40'
                : 'bg-white/90 dark:bg-[#071912]/90 text-[#272727] dark:text-[#F5EFE5] border-black/10 dark:border-white/15 hover:border-[#944426] dark:hover:border-[#D9AE29]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filter Postures</span>
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-[#944426] text-white dark:bg-[#00381F] dark:text-[#D9AE29] text-[10px] font-mono font-bold">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isFilterDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Small Right-Side Dropdown Floating Panel */}
          <AnimatePresence>
            {isFilterDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 top-full mt-3 z-50 w-[calc(100vw-2.5rem)] sm:w-[360px] max-w-[360px] p-4 rounded-3xl bg-white/95 dark:bg-[#071912]/95 backdrop-blur-2xl border border-[#00381F]/20 dark:border-[#D9AE29]/30 shadow-2xl space-y-3.5 text-[#272727] dark:text-[#F5EFE5]"
              >
                {/* Dropdown Header */}
                <div className="flex items-center justify-between pb-2 border-b border-black/10 dark:border-white/10 text-xs">
                  <span className="font-mono font-bold uppercase tracking-wider text-[#00381F] dark:text-[#D9AE29]">
                    Filter Options
                  </span>
                  {activeFilterCount > 0 && (
                    <button
                      id="reset-filters-popover-btn"
                      onClick={clearAllFilters}
                      className="text-[11px] font-semibold text-[#944426] dark:text-[#D9AE29] hover:underline flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Clear all ({activeFilterCount})
                    </button>
                  )}
                </div>

                {/* Filter Category Tabs in Small Dropdown */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-black/5 dark:bg-white/5 text-[11px] font-semibold">
                  <button
                    onClick={() => setActiveFilterTab('category')}
                    className={`flex-1 py-1 px-2 rounded-lg transition-all text-center ${
                      activeFilterTab === 'category'
                        ? 'bg-[#00381F] text-white dark:bg-[#D9AE29] dark:text-[#00381F] shadow-sm'
                        : 'text-stone-600 dark:text-stone-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    Category
                  </button>
                  <button
                    onClick={() => setActiveFilterTab('level')}
                    className={`flex-1 py-1 px-2 rounded-lg transition-all text-center ${
                      activeFilterTab === 'level'
                        ? 'bg-[#00381F] text-white dark:bg-[#D9AE29] dark:text-[#00381F] shadow-sm'
                        : 'text-stone-600 dark:text-stone-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    Level
                  </button>
                  <button
                    onClick={() => setActiveFilterTab('movement')}
                    className={`flex-1 py-1 px-2 rounded-lg transition-all text-center ${
                      activeFilterTab === 'movement'
                        ? 'bg-[#00381F] text-white dark:bg-[#D9AE29] dark:text-[#00381F] shadow-sm'
                        : 'text-stone-600 dark:text-stone-400 hover:text-black dark:hover:text-white'
                    }`}
                  >
                    Movement
                  </button>
                </div>

                {/* Tab Content List */}
                <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                  {/* Category Tab */}
                  {activeFilterTab === 'category' && (
                    <div className="space-y-1">
                      {categoryOptions.map((opt) => {
                        const isSelected = selectedCategory === opt.value;
                        const count = opt.value === 'All' 
                          ? ASANAS.length 
                          : ASANAS.filter((a) => a.category === opt.value).length;
                        return (
                          <button
                            key={opt.value}
                            id={`filter-opt-cat-${opt.value}`}
                            onClick={() => {
                              setSelectedCategory(opt.value);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all ${
                              isSelected
                                ? 'bg-[#00381F] text-[#F5EFE5] dark:bg-[#D9AE29] dark:text-[#00381F] font-bold'
                                : 'hover:bg-black/5 dark:hover:bg-white/10 text-[#272727] dark:text-[#F5EFE5]'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <Compass className="w-3.5 h-3.5 opacity-70 shrink-0" />
                              <span className="truncate">{opt.label}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                                isSelected ? 'bg-white/20 text-white dark:text-black dark:bg-black/20' : 'bg-black/5 dark:bg-white/10 text-stone-500 dark:text-stone-400'
                              }`}>
                                {count}
                              </span>
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Level Tab */}
                  {activeFilterTab === 'level' && (
                    <div className="space-y-1">
                      {levelOptions.map((opt) => {
                        const isSelected = selectedDifficulty === opt.value;
                        const count = opt.value === 'All' 
                          ? ASANAS.length 
                          : ASANAS.filter((a) => a.difficulty === opt.value).length;
                        return (
                          <button
                            key={opt.value}
                            id={`filter-opt-level-${opt.value}`}
                            onClick={() => {
                              setSelectedDifficulty(opt.value);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all ${
                              isSelected
                                ? 'bg-[#944426] text-white dark:bg-[#D9AE29] dark:text-[#00381F] font-bold'
                                : 'hover:bg-black/5 dark:hover:bg-white/10 text-[#272727] dark:text-[#F5EFE5]'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <Flame className="w-3.5 h-3.5 opacity-70 shrink-0" />
                              <span className="truncate">{opt.label}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                                isSelected ? 'bg-white/20 text-white dark:text-black dark:bg-black/20' : 'bg-black/5 dark:bg-white/10 text-stone-500 dark:text-stone-400'
                              }`}>
                                {count}
                              </span>
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Movement Tab */}
                  {activeFilterTab === 'movement' && (
                    <div className="space-y-1">
                      {movementOptions.map((opt) => {
                        const isSelected = selectedMovement === opt.value;
                        const count = opt.value === 'All' 
                          ? ASANAS.length 
                          : ASANAS.filter((a) => a.movementTypes.includes(opt.value as MovementType)).length;
                        return (
                          <button
                            key={opt.value}
                            id={`filter-opt-mov-${opt.value}`}
                            onClick={() => {
                              setSelectedMovement(opt.value);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all ${
                              isSelected
                                ? 'bg-[#00381F] text-[#D9AE29] dark:bg-[#D9AE29] dark:text-[#00381F] font-bold'
                                : 'hover:bg-black/5 dark:hover:bg-white/10 text-[#272727] dark:text-[#F5EFE5]'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <Zap className="w-3.5 h-3.5 opacity-70 shrink-0" />
                              <span className="truncate">{opt.label}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                                isSelected ? 'bg-white/20 text-[#D9AE29] dark:text-black' : 'bg-black/5 dark:bg-white/10 text-stone-500 dark:text-stone-400'
                              }`}>
                                {count}
                              </span>
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Popover Footer Info */}
                <div className="pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[11px] font-mono text-stone-500 dark:text-stone-400">
                  <span>{filteredAsanas.length} matching</span>
                  <button
                    onClick={() => setIsFilterDropdownOpen(false)}
                    className="font-bold text-[#00381F] dark:text-[#D9AE29] hover:underline"
                  >
                    Done
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Active Filter Badges Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/70 dark:bg-[#071912]/70 backdrop-blur-md border border-[#00381F]/10 dark:border-[#D9AE29]/20 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono font-bold uppercase tracking-wider text-[#00381F] dark:text-[#D9AE29] text-[11px]">
            Active Filters:
          </span>
          {selectedCategory !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#00381F] text-[#F5EFE5] dark:bg-[#00381F] dark:text-[#D9AE29] font-mono font-bold text-[11px] border border-[#D9AE29]/30 shadow-sm">
              <span>Category: {selectedCategory}</span>
              <button 
                id="remove-category-filter-btn"
                onClick={() => setSelectedCategory('All')} 
                className="hover:text-red-400 font-bold ml-0.5"
                title="Remove category filter"
              >
                ×
              </button>
            </span>
          )}
          {selectedDifficulty !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#944426] text-white dark:bg-[#944426]/70 dark:text-[#D9AE29] font-mono font-bold text-[11px] border border-[#944426]/50 shadow-sm">
              <span>Level: {selectedDifficulty}</span>
              <button 
                id="remove-difficulty-filter-btn"
                onClick={() => setSelectedDifficulty('All')} 
                className="hover:text-red-400 font-bold ml-0.5"
                title="Remove level filter"
              >
                ×
              </button>
            </span>
          )}
          {selectedMovement !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-700 text-white dark:bg-blue-950 dark:text-blue-300 font-mono font-bold text-[11px] border border-blue-400/40 shadow-sm">
              <span>Movement: {selectedMovement}</span>
              <button 
                id="remove-movement-filter-btn"
                onClick={() => setSelectedMovement('All')} 
                className="hover:text-red-400 font-bold ml-0.5"
                title="Remove movement filter"
              >
                ×
              </button>
            </span>
          )}
          {activeFilterCount === 0 && (
            <span className="italic text-stone-500 dark:text-stone-400">All sacred postures active</span>
          )}
        </div>

        <div className="font-mono text-xs font-semibold text-[#00381F] dark:text-[#D9AE29] shrink-0">
          {filteredAsanas.length} of {ASANAS.length} Postures
        </div>
      </div>

      {/* Full-Width Asana 3D Cards Grid */}
      {filteredAsanas.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white/60 dark:bg-[#071912]/60 backdrop-blur-md border border-black/5 dark:border-white/10 text-center space-y-3">
          <Sparkles className="w-8 h-8 text-[#944426] dark:text-[#D9AE29] mx-auto opacity-70" />
          <h3 className="font-display text-xl font-bold text-[#00381F] dark:text-[#F5EFE5]">
            No postures match your selected combination
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
            Try adjusting your category, level, or movement filters from the right-side dropdown to view more asanas.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 rounded-full bg-[#00381F] text-[#F5EFE5] dark:bg-[#D9AE29] dark:text-[#00381F] text-xs font-bold shadow-md hover:scale-105 transition-transform mt-2"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAsanas.map((asana) => (
            <div
              key={asana.id}
              id={`asana-card-${asana.slug}`}
              onClick={() => handleCardClick(asana)}
              className="group relative rounded-3xl bg-white/80 dark:bg-[#071912]/80 backdrop-blur-xl border border-[#00381F]/15 dark:border-[#D9AE29]/25 overflow-hidden hover:shadow-2xl hover:border-[#944426] dark:hover:border-[#D9AE29] transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              {/* Card Visual / Photography Header */}
              <div className="relative h-52 w-full overflow-hidden bg-[#00381F]/10 dark:bg-black/40 border-b border-black/5 dark:border-white/10">
                {asana.imageUrl ? (
                  <img
                    src={asana.imageUrl}
                    alt={`${asana.englishName} (${asana.sanskritName})`}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-b from-[#F5EFE5]/50 to-[#9D9D48]/20 dark:from-[#00381F]/30 dark:to-black/50 flex items-center justify-center p-5">
                    <div className="relative w-16 h-16 rounded-full bg-[#00381F]/10 dark:bg-[#D9AE29]/15 flex items-center justify-center border border-[#00381F]/20 dark:border-[#D9AE29]/30">
                      <Sparkles className="w-6 h-6 text-[#944426] dark:text-[#D9AE29]" />
                    </div>
                  </div>
                )}

                {/* Shading Gradient for Badge Legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />

                {/* Difficulty & Category Badges (Top Left) */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#00381F]/90 dark:bg-[#D9AE29]/90 text-[#F5EFE5] dark:text-[#00381F] text-[10px] font-mono font-bold uppercase backdrop-blur-md shadow-sm">
                    {asana.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/90 dark:bg-black/80 text-[#272727] dark:text-[#F5EFE5] text-[10px] font-mono font-bold backdrop-blur-md border border-white/20 dark:border-white/10 shadow-sm">
                    {asana.difficulty}
                  </span>
                </div>

                {/* 3D Anatomical Studio Pill (Top Right) */}
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-mono font-bold group-hover:bg-[#944426] dark:group-hover:bg-[#D9AE29] dark:group-hover:text-[#00381F] transition-colors shadow-sm">
                  <Box className="w-3 h-3" />
                  <span>3D</span>
                </div>

                {/* Primary Muscle Badge (Bottom Left/Right) */}
                {asana.muscles[0] && (
                  <div className="absolute bottom-3 left-3 z-10 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/90 dark:bg-[#071912]/90 text-[#944426] dark:text-[#D9AE29] backdrop-blur-md border border-[#944426]/30 dark:border-[#D9AE29]/30 font-semibold shadow-sm">
                    {asana.muscles[0].name.split('(')[0]}
                  </div>
                )}

                {/* Sanskrit Script Overlay on Bottom Right */}
                <div className="absolute bottom-2.5 right-3 z-10 text-white/90 font-sans text-xs font-medium tracking-wide drop-shadow-md">
                  {asana.sanskritScript}
                </div>
              </div>

              {/* Card Editorial Info */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-display text-xl font-bold text-[#00381F] dark:text-[#F5EFE5] group-hover:text-[#944426] dark:group-hover:text-[#D9AE29] transition-colors">
                    {asana.englishName}
                  </h3>
                  
                  <div className="font-accent italic text-sm text-[#944426] dark:text-[#D9AE29] flex items-center gap-2 mt-0.5">
                    <span>{asana.sanskritName}</span>
                    <span className="text-xs font-sans text-stone-500 dark:text-stone-400">({asana.sanskritScript})</span>
                  </div>

                  <p className="text-xs font-sans-ui text-[#272727]/80 dark:text-[#F5EFE5]/80 line-clamp-2 mt-2 leading-relaxed">
                    {asana.shortDescription}
                  </p>
                </div>

                {/* Bottom Stats & CTA */}
                <div className="pt-3 border-t border-[#00381F]/10 dark:border-white/10 flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                    <span className="flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-[#944426] dark:text-[#D9AE29]" />
                      {asana.steps.length} Steps
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-[#D9AE29]" />
                      {asana.chakras.length} Chakras
                    </span>
                  </div>

                  <span className="flex items-center gap-1 text-xs font-bold text-[#00381F] dark:text-[#D9AE29] group-hover:translate-x-1 transition-transform">
                    Open 3D &rarr;
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

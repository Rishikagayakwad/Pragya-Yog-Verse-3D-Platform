import React from 'react';
import { Sparkles, Search, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  currentView: 'home' | 'library' | 'studio' | 'about';
  onNavigate: (view: 'home' | 'library' | 'studio' | 'about') => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenSearch: () => void;
  activeAsanaName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  isDark,
  onToggleTheme,
  onOpenSearch,
  activeAsanaName,
}) => {
  const handleLogoClick = () => {
    onNavigate('library');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-8 py-3 sm:py-4 transition-all duration-300 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
          <button
            id="brand-logo-btn"
            onClick={handleLogoClick}
            className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-[#F5EFE5]/90 dark:bg-[#071912]/90 backdrop-blur-xl border border-[#00381F]/15 dark:border-[#D9AE29]/30 shadow-md transition-transform hover:scale-105 cursor-pointer"
            title="Pragya Yog Verse - Home Library"
          >
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#944426] dark:bg-[#D9AE29] flex items-center justify-center text-white dark:text-[#00381F] shadow-sm">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
            <span className="font-display font-bold tracking-wider text-xs sm:text-sm text-[#00381F] dark:text-[#F5EFE5] uppercase">
              Pragya Yog Verse
            </span>
          </button>

          {activeAsanaName && currentView === 'studio' && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5EFE5]/60 dark:bg-black/50 backdrop-blur-md border border-black/10 dark:border-white/10 text-xs font-serif-display font-medium text-[#944426] dark:text-[#D9AE29]">
              <span>/</span>
              <span className="font-semibold">{activeAsanaName}</span>
            </div>
          )}
        </div>

        {/* Quick Actions (Search, Theme) */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          {/* Search Trigger */}
          <button
            id="global-search-btn"
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#F5EFE5]/85 dark:bg-[#00381F]/90 backdrop-blur-md border border-[#00381F]/15 dark:border-[#D9AE29]/30 text-[#272727] dark:text-[#F5EFE5] hover:border-[#944426] dark:hover:border-[#D9AE29] shadow-sm transition-all text-xs cursor-pointer"
            title="Search Asanas (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-[#944426] dark:text-[#D9AE29]" />
            <span className="hidden sm:inline font-sans-ui text-xs">Search</span>
            <kbd className="hidden lg:inline text-[9px] px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono">⌘K</kbd>
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            id="toggle-theme-btn"
            onClick={onToggleTheme}
            className="p-2 rounded-full bg-[#F5EFE5]/85 dark:bg-[#00381F]/90 backdrop-blur-md border border-[#00381F]/15 dark:border-[#D9AE29]/30 text-[#272727] dark:text-[#F5EFE5] hover:text-[#D9AE29] shadow-sm transition-all cursor-pointer"
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-[#D9AE29]" /> : <Moon className="w-3.5 h-3.5 text-[#00381F]" />}
          </button>
        </div>
      </div>
    </header>
  );
};

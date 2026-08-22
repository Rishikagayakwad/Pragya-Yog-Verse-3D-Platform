import React, { useState } from 'react';
import { Sparkles, Search, Sun, Moon, Home, BookOpen, Layers, Menu, X } from 'lucide-react';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogoClick = () => {
    setMobileMenuOpen(false);
    onNavigate('home');
  };

  const handleNavClick = (view: 'home' | 'library' | 'studio' | 'about') => {
    setMobileMenuOpen(false);
    onNavigate(view);
  };

  const handleSearchClick = () => {
    setMobileMenuOpen(false);
    onOpenSearch();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-8 py-3 sm:py-4 transition-all duration-300 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
          <button
            id="brand-logo-btn"
            onClick={handleLogoClick}
            className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-[#F5EFE5]/90 dark:bg-[#071912]/90 backdrop-blur-xl border border-[#00381F]/15 dark:border-[#D9AE29]/30 shadow-md transition-transform hover:scale-105"
          >
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#944426] dark:bg-[#D9AE29] flex items-center justify-center text-white dark:text-[#00381F] shadow-sm">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
            <span className="font-display font-bold tracking-wider text-xs sm:text-sm text-[#00381F] dark:text-[#F5EFE5] uppercase">
              Pragya Yog Verse
            </span>
          </button>

          {activeAsanaName && currentView === 'studio' && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5EFE5]/60 dark:bg-black/50 backdrop-blur-md border border-black/10 dark:border-white/10 text-xs font-serif-display font-medium text-[#944426] dark:text-[#D9AE29]">
              <span>/</span>
              <span className="font-semibold">{activeAsanaName}</span>
            </div>
          )}
        </div>

        {/* Global Navigation Links (Desktop) */}
        <nav className="pointer-events-auto hidden md:flex items-center gap-1.5 p-1 rounded-full bg-[#F5EFE5]/85 dark:bg-[#00381F]/90 backdrop-blur-md border border-[#00381F]/15 dark:border-[#D9AE29]/30 shadow-sm">
          <button
            id="nav-home-btn"
            onClick={() => handleNavClick('home')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              currentView === 'home'
                ? 'bg-[#00381F] text-[#F5EFE5] dark:bg-[#D9AE29] dark:text-[#00381F] font-semibold shadow-sm'
                : 'text-[#272727] dark:text-[#F5EFE5] hover:text-[#944426] dark:hover:text-[#D9AE29]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Home className="w-3.5 h-3.5" />
              Home
            </span>
          </button>

          <button
            id="nav-library-btn"
            onClick={() => handleNavClick('library')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              currentView === 'library'
                ? 'bg-[#00381F] text-[#F5EFE5] dark:bg-[#D9AE29] dark:text-[#00381F] font-semibold shadow-sm'
                : 'text-[#272727] dark:text-[#F5EFE5] hover:text-[#944426] dark:hover:text-[#D9AE29]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Library
            </span>
          </button>

          <button
            id="nav-studio-btn"
            onClick={() => handleNavClick('studio')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              currentView === 'studio'
                ? 'bg-[#00381F] text-[#F5EFE5] dark:bg-[#D9AE29] dark:text-[#00381F] font-semibold shadow-sm'
                : 'text-[#272727] dark:text-[#F5EFE5] hover:text-[#944426] dark:hover:text-[#D9AE29]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              3D Studio
            </span>
          </button>
        </nav>

        {/* Quick Actions (Search, Theme, Mobile Hamburger) */}
        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
          {/* Search Trigger */}
          <button
            id="global-search-btn"
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#F5EFE5]/85 dark:bg-[#00381F]/90 backdrop-blur-md border border-[#00381F]/15 dark:border-[#D9AE29]/30 text-[#272727] dark:text-[#F5EFE5] hover:border-[#944426] dark:hover:border-[#D9AE29] shadow-sm transition-all text-xs"
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
            className="p-2 rounded-full bg-[#F5EFE5]/85 dark:bg-[#00381F]/90 backdrop-blur-md border border-[#00381F]/15 dark:border-[#D9AE29]/30 text-[#272727] dark:text-[#F5EFE5] hover:text-[#D9AE29] shadow-sm transition-all"
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-[#D9AE29]" /> : <Moon className="w-3.5 h-3.5 text-[#00381F]" />}
          </button>

          {/* Mobile Hamburger Menu Toggle Button */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full bg-[#F5EFE5]/90 dark:bg-[#00381F]/90 backdrop-blur-md border border-[#00381F]/15 dark:border-[#D9AE29]/30 text-[#00381F] dark:text-[#D9AE29] shadow-sm transition-all"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Responsive Navigation Drawer / Dropdown */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto md:hidden mt-3 max-w-sm mx-auto rounded-3xl bg-[#F5EFE5]/95 dark:bg-[#071912]/95 backdrop-blur-2xl border border-[#00381F]/20 dark:border-[#D9AE29]/30 shadow-2xl p-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-2">
            <button
              id="mobile-nav-home-btn"
              onClick={() => handleNavClick('home')}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                currentView === 'home'
                  ? 'bg-[#00381F] text-[#F5EFE5] dark:bg-[#D9AE29] dark:text-[#00381F] shadow-sm'
                  : 'text-[#272727] dark:text-[#F5EFE5] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Home className="w-4 h-4" />
                <span>Home Experience</span>
              </div>
              <span className="text-[10px] font-mono opacity-70">01</span>
            </button>

            <button
              id="mobile-nav-library-btn"
              onClick={() => handleNavClick('library')}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                currentView === 'library'
                  ? 'bg-[#00381F] text-[#F5EFE5] dark:bg-[#D9AE29] dark:text-[#00381F] shadow-sm'
                  : 'text-[#272727] dark:text-[#F5EFE5] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4" />
                <span>Asana Library</span>
              </div>
              <span className="text-[10px] font-mono opacity-70">02</span>
            </button>

            <button
              id="mobile-nav-studio-btn"
              onClick={() => handleNavClick('studio')}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                currentView === 'studio'
                  ? 'bg-[#00381F] text-[#F5EFE5] dark:bg-[#D9AE29] dark:text-[#00381F] shadow-sm'
                  : 'text-[#272727] dark:text-[#F5EFE5] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4" />
                <span>3D Anatomical Studio</span>
              </div>
              <span className="text-[10px] font-mono opacity-70">03</span>
            </button>

            <div className="h-px bg-black/10 dark:bg-white/10 my-1" />

            <button
              id="mobile-nav-search-btn"
              onClick={handleSearchClick}
              className="flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-black/5 dark:hover:bg-white/5"
            >
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 text-[#944426] dark:text-[#D9AE29]" />
                <span>Search Sanskrit & English Asanas</span>
              </div>
              <kbd className="text-[10px] px-2 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono">⌘K</kbd>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

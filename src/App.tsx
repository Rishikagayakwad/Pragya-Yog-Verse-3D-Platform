import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AsanaLibrary } from './components/AsanaLibrary';
import { AsanaStudio } from './components/AsanaStudio';
import { SearchModal } from './components/SearchModal';
import { ASANAS } from './data/asanas';
import type { Asana, AppView } from './types';

/**
 * Reads `?asana=<slug>` so a posture has its own shareable address.
 */
function asanaFromUrl(): Asana | null {
  if (typeof window === 'undefined') return null;
  const slug = new URLSearchParams(window.location.search).get('asana');
  if (!slug) return null;
  return ASANAS.find((a) => a.slug === slug || a.id === slug) ?? null;
}

export default function App() {
  const linkedAsana = typeof window !== 'undefined' ? asanaFromUrl() : null;

  // Default to Studio view with Warrior II (ASANAS[0]) to match the requested layout
  const [currentView, setCurrentView] = useState<AppView>('studio');
  const defaultPose = ASANAS[0]; // Virabhadrasana II (Warrior II)
  const [activeAsana, setActiveAsana] = useState<Asana>(linkedAsana ?? defaultPose);
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pragya_yog_theme') || localStorage.getItem('3d_asana_theme');
      if (saved !== null) return saved === 'dark';
      return true; // Default dark mode across every page
    }
    return true;
  });
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Sync theme with html root class
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('pragya_yog_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('pragya_yog_theme', 'light');
    }
  }, [isDark]);

  // Global keyboard shortcuts (Cmd+K for search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const syncUrl = (slug: string | null) => {
    const url = slug ? `${window.location.pathname}?asana=${slug}` : window.location.pathname;
    window.history.pushState({ asana: slug }, '', url);
  };

  useEffect(() => {
    const onPopState = () => {
      const linked = asanaFromUrl();
      if (linked) {
        setActiveAsana(linked);
        setCurrentView('studio');
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleSelectAsana = (asana: Asana) => {
    setActiveAsana(asana);
    setCurrentView('studio');
    syncUrl(asana.slug);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0c0e12] text-[#F5EFE5] font-sans-ui selection:bg-[#944426] selection:text-white">
      {/* Studio View (Fullscreen, zero page scrollbar) */}
      {currentView === 'studio' && (
        <AsanaStudio
          asana={activeAsana}
          onSelectOtherAsana={handleSelectAsana}
          onBack={() => {
            setCurrentView('library');
            syncUrl(null);
          }}
          isDark={isDark}
        />
      )}

      {/* Library View (Fallback / Alternative catalog screen) */}
      {currentView === 'library' && (
        <div className="h-screen w-screen overflow-y-auto custom-scrollbar">
          <Navbar
            currentView={currentView}
            onNavigate={(view) => setCurrentView(view)}
            isDark={isDark}
            onToggleTheme={() => setIsDark((prev) => !prev)}
            onOpenSearch={() => setIsSearchOpen(true)}
            activeAsanaName={activeAsana.englishName}
          />
          <AsanaLibrary
            onSelectAsana={handleSelectAsana}
            isDark={isDark}
          />
        </div>
      )}

      {/* Global Search Command Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectAsana={handleSelectAsana}
      />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AsanaLibrary } from './components/AsanaLibrary';
import { AsanaStudio } from './components/AsanaStudio';
import { SearchModal } from './components/SearchModal';
import { ASANAS } from './data/asanas';
import type { Asana, AppView } from './types';

/**
 * Reads `?asana=<slug>` so a posture has its own shareable address.
 *
 * Without it the studio is unreachable except by clicking through the library,
 * which means a pose cannot be linked, bookmarked, or opened directly.
 */
function asanaFromUrl(): Asana | null {
  if (typeof window === 'undefined') return null;
  const slug = new URLSearchParams(window.location.search).get('asana');
  if (!slug) return null;
  return ASANAS.find((a) => a.slug === slug || a.id === slug) ?? null;
}

export default function App() {
  const linkedAsana = typeof window !== 'undefined' ? asanaFromUrl() : null;

  const [currentView, setCurrentView] = useState<AppView>(linkedAsana ? 'studio' : 'library');
  const defaultTreePose = ASANAS.find((a) => a.slug === 'vrikshasana') || ASANAS[0];
  const [activeAsana, setActiveAsana] = useState<Asana>(linkedAsana ?? defaultTreePose);
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

  // Keep the address bar in step, so the browser Back button and a copied link
  // both behave the way people expect.
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
      } else {
        setCurrentView('library');
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleSelectAsana = (asana: Asana) => {
    setActiveAsana(asana);
    setCurrentView('studio');
    syncUrl(asana.slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectOtherAsana = (slug: string) => {
    const found = ASANAS.find((a) => a.slug === slug || a.id === slug);
    if (found) {
      setActiveAsana(found);
      syncUrl(found.slug);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F5EFE5] dark:bg-[#06140e] text-[#272727] dark:text-[#F5EFE5] font-sans-ui selection:bg-[#944426] selection:text-white transition-colors duration-500">
      
      {/* Floating Global Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
        onOpenSearch={() => setIsSearchOpen(true)}
        activeAsanaName={currentView === 'studio' ? activeAsana.englishName : undefined}
      />

      {/* Main View Router */}
      <main className="w-full">
        {currentView === 'library' && (
          <AsanaLibrary
            onSelectAsana={handleSelectAsana}
            isDark={isDark}
          />
        )}

        {currentView === 'studio' && (
          <AsanaStudio
            asana={activeAsana}
            onSelectOtherAsana={handleSelectOtherAsana}
            onBack={() => {
              setCurrentView('library');
              syncUrl(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            isDark={isDark}
          />
        )}
      </main>

      {/* Global Search Command Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectAsana={handleSelectAsana}
      />
    </div>
  );
}

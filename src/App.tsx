import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AsanaLibrary } from './components/AsanaLibrary';
import { AsanaStudio } from './components/AsanaStudio';
import { SearchModal } from './components/SearchModal';
import { ASANAS } from './data/asanas';
import { Asana, AppView } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('library');
  const defaultTreePose = ASANAS.find((a) => a.slug === 'vrikshasana') || ASANAS[0];
  const [activeAsana, setActiveAsana] = useState<Asana>(defaultTreePose);
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

  const handleSelectAsana = (asana: Asana) => {
    setActiveAsana(asana);
    setCurrentView('studio');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectOtherAsana = (slug: string) => {
    const found = ASANAS.find((a) => a.slug === slug || a.id === slug);
    if (found) {
      setActiveAsana(found);
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

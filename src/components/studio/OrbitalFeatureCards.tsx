import React from 'react';
import { 
  Sparkles, 
  Activity, 
  Eye, 
  Compass, 
  Heart, 
  AlertTriangle, 
  Wind, 
  Bot, 
  BookOpen, 
  Layers
} from 'lucide-react';
import type { ActiveStudioSection } from '../../types';

interface OrbitalFeatureCardsProps {
  activeSection: ActiveStudioSection | null;
  onSelectSection: (section: ActiveStudioSection) => void;
  onOpenAI: () => void;
  variant?: 'left' | 'right' | 'horizontal-bar';
}

interface FeatureItem {
  id: ActiveStudioSection;
  label: string;
  sublabel: string;
  Icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  activeRing: string;
  isAiTrigger?: boolean;
}

export const OrbitalFeatureCards: React.FC<OrbitalFeatureCardsProps> = ({
  activeSection,
  onSelectSection,
  onOpenAI,
  variant = 'left',
}) => {
  // Left Column Features (Warm, grounded, anatomy & energetic awareness)
  const leftFeatures: FeatureItem[] = [
    {
      id: 'chakra',
      label: 'Chakra',
      sublabel: '7 Energy Centers',
      Icon: Sparkles,
      iconBg: 'bg-[#620513]/15 text-[#620513] dark:text-[#D9AE29] border-[#620513]/25',
      activeRing: 'border-[#620513] shadow-md ring-1 ring-[#620513] bg-[#620513]/10 dark:bg-[#620513]/30',
    },
    {
      id: 'muscles',
      label: 'Muscles',
      sublabel: 'Activation Map',
      Icon: Activity,
      iconBg: 'bg-[#944426]/15 text-[#944426] dark:text-[#D9AE29] border-[#944426]/25',
      activeRing: 'border-[#944426] shadow-md ring-1 ring-[#944426] bg-[#944426]/10 dark:bg-[#944426]/30',
    },
    {
      id: 'drishti',
      label: 'Drishti',
      sublabel: 'Point of Focus',
      Icon: Eye,
      iconBg: 'bg-[#00381F]/15 text-[#00381F] dark:text-[#D9AE29] border-[#00381F]/25',
      activeRing: 'border-[#00381F] shadow-md ring-1 ring-[#00381F] bg-[#00381F]/10 dark:bg-[#00381F]/30',
    },
    {
      id: 'position',
      label: 'Position',
      sublabel: 'Alignment & Form',
      Icon: Compass,
      iconBg: 'bg-[#9D9D48]/20 text-[#00381F] dark:text-[#D9AE29] border-[#9D9D48]/35',
      activeRing: 'border-[#9D9D48] shadow-md ring-1 ring-[#9D9D48] bg-[#9D9D48]/15 dark:bg-[#9D9D48]/30',
    },
  ];

  // Right Column Features
  const rightFeatures: FeatureItem[] = [
    {
      id: 'benefits',
      label: 'Benefits',
      sublabel: 'Physical & Mental',
      Icon: Heart,
      iconBg: 'bg-[#00381F]/15 text-[#00381F] dark:text-[#D9AE29] border-[#00381F]/25',
      activeRing: 'border-[#00381F] shadow-md ring-1 ring-[#00381F] bg-[#00381F]/10 dark:bg-[#00381F]/30',
    },
    {
      id: 'contraindications',
      label: 'Contraindications',
      sublabel: 'Precautions',
      Icon: AlertTriangle,
      iconBg: 'bg-[#944426]/15 text-[#944426] dark:text-[#D9AE29] border-[#944426]/25',
      activeRing: 'border-[#944426] shadow-md ring-1 ring-[#944426] bg-[#944426]/10 dark:bg-[#944426]/30',
    },
    {
      id: 'breath',
      label: 'Breath',
      sublabel: 'Inhale & Exhale',
      Icon: Wind,
      iconBg: 'bg-[#9D9D48]/20 text-[#00381F] dark:text-[#D9AE29] border-[#9D9D48]/35',
      activeRing: 'border-[#9D9D48] shadow-md ring-1 ring-[#9D9D48] bg-[#9D9D48]/15 dark:bg-[#9D9D48]/30',
    },
    {
      id: 'ai-teacher',
      label: 'AI Explanation',
      sublabel: 'AI Yoga Guide',
      Icon: Bot,
      iconBg: 'bg-[#620513]/15 text-[#620513] dark:text-[#D9AE29] border-[#620513]/25',
      activeRing: 'border-[#620513] shadow-md ring-1 ring-[#620513] bg-[#620513]/10 dark:bg-[#620513]/30',
      isAiTrigger: true,
    },
    {
      id: 'significance',
      label: 'Significance',
      sublabel: 'History & Meaning',
      Icon: BookOpen,
      iconBg: 'bg-[#D9AE29]/20 text-[#944426] dark:text-[#D9AE29] border-[#D9AE29]/35',
      activeRing: 'border-[#D9AE29] shadow-md ring-1 ring-[#D9AE29] bg-[#D9AE29]/15 dark:bg-[#D9AE29]/30',
    },
  ];

  // Horizontal chips representation for tablet and mobile
  if (variant === 'horizontal-bar') {
    const allFeatures = [...leftFeatures, ...rightFeatures];
    return (
      <div 
        id="mobile-feature-tabs"
        className="w-full flex items-center gap-2 overflow-x-auto pb-1 px-1 no-scrollbar select-none"
      >
        {allFeatures.map((item) => {
          const isActive = activeSection === item.id;
          const { id, label, Icon, isAiTrigger, iconBg } = item;
          return (
            <button
              key={id}
              id={`tab-chip-${id}`}
              onClick={() => {
                if (isAiTrigger) onOpenAI();
                else onSelectSection(id);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 border ${
                isActive
                  ? 'bg-[#00381F] text-[#F5EFE5] border-[#00381F] dark:bg-[#D9AE29] dark:text-[#00381F] dark:border-[#D9AE29] shadow-sm'
                  : 'bg-[#FAF6F0]/90 dark:bg-[#071912]/90 text-[#272727] dark:text-[#F5EFE5] border-[#00381F]/15 dark:border-[#D9AE29]/20 hover:bg-[#00381F]/5 dark:hover:bg-white/10'
              }`}
            >
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center ${isActive ? 'bg-[#F5EFE5] text-[#00381F] dark:bg-[#00381F] dark:text-[#D9AE29]' : iconBg}`}>
                <Icon className="w-3 h-3" />
              </div>
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Left or Right Stacked Dock Cards
  const items = variant === 'left' ? leftFeatures : rightFeatures;

  return (
    <div className="flex flex-col gap-2 z-20">
      {items.map((item) => {
        const isActive = activeSection === item.id;
        const { id, label, sublabel, Icon, iconBg, activeRing, isAiTrigger } = item;

        return (
          <button
            key={id}
            id={`orbital-card-${id}`}
            onClick={() => {
              if (isAiTrigger) onOpenAI();
              else onSelectSection(id);
            }}
            className={`group flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl border backdrop-blur-xl transition-all duration-300 text-left cursor-pointer ${
              isActive
                ? `${activeRing} text-[#272727] dark:text-[#F5EFE5]`
                : 'bg-[#FAF6F0]/90 dark:bg-[#071912]/85 text-[#272727] dark:text-[#F5EFE5] border-[#00381F]/15 dark:border-[#D9AE29]/20 hover:border-[#00381F]/30 hover:bg-white/95 dark:hover:bg-[#002816]/90 shadow-sm'
            }`}
          >
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border group-hover:scale-105 transition-transform duration-200 ${iconBg}`}>
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="truncate">
              <div className="font-display font-bold text-xs text-[#00381F] dark:text-[#F5EFE5]">{label}</div>
              <div className="text-[10px] text-[#272727]/70 dark:text-[#F5EFE5]/70 font-sans">{sublabel}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
};


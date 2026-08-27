import React from 'react';
import { 
  BookOpen, 
  User, 
  Link as LinkIcon, 
  Users, 
  Sparkles, 
  Activity, 
  Layers 
} from 'lucide-react';

interface LeftNavSidebarProps {
  activeNav: 'library' | 'anatomy' | 'sequence' | 'community';
  onSelectNav: (nav: 'library' | 'anatomy' | 'sequence' | 'community') => void;
}

export const LeftNavSidebar: React.FC<LeftNavSidebarProps> = ({
  activeNav,
  onSelectNav,
}) => {
  const navItems = [
    {
      id: 'library' as const,
      label: 'Pose Library',
      Icon: BookOpen,
    },
    {
      id: 'anatomy' as const,
      label: 'Anatomy',
      Icon: User,
    },
    {
      id: 'sequence' as const,
      label: 'Sequence Builder',
      Icon: LinkIcon,
    },
    {
      id: 'community' as const,
      label: 'Community',
      Icon: Users,
    },
  ];

  return (
    <div
      id="left-navigation-sidebar-card"
      className="p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl bg-[#14110e]/85 dark:bg-[#071912]/90 backdrop-blur-2xl border border-[#c59b27]/30 shadow-2xl space-y-1.5 text-[#F5EFE5] select-none"
    >
      {navItems.map(({ id, label, Icon }) => {
        const isActive = activeNav === id;
        return (
          <button
            key={id}
            id={`left-nav-item-${id}`}
            onClick={() => onSelectNav(id)}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl sm:rounded-2xl transition-all duration-200 cursor-pointer font-sans text-xs font-semibold tracking-wide text-left ${
              isActive
                ? 'bg-[#D9AE29] text-[#0c0e12] font-bold shadow-[0_0_20px_rgba(217,174,41,0.35)] ring-1 ring-[#D9AE29]'
                : 'text-[#F5EFE5]/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#0c0e12]' : 'text-[#D9AE29]'}`} />
            <span className="truncate">{label}</span>
          </button>
        );
      })}
    </div>
  );
};

import React from 'react';
import { Camera, Bone, Activity, Layers } from 'lucide-react';

export type StudioViewMode = 'camera' | 'bone' | 'muscle';

interface TopModeSwitcherProps {
  viewMode: StudioViewMode;
  onSetViewMode: (mode: StudioViewMode) => void;
}

export const TopModeSwitcher: React.FC<TopModeSwitcherProps> = ({
  viewMode,
  onSetViewMode,
}) => {
  const modes = [
    { id: 'camera' as const, label: 'Camera', Icon: Camera, tip: 'Natural character view' },
    { id: 'bone' as const, label: 'Bone', Icon: Bone, tip: '3D skeletal structure & joint alignment' },
    { id: 'muscle' as const, label: 'Muscle', Icon: Activity, tip: '3D muscular activation & heatmaps' },
  ];

  return (
    <div
      id="top-mode-switcher-bar"
      className="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-2xl sm:rounded-3xl bg-[#14110e]/90 dark:bg-[#071912]/92 backdrop-blur-2xl border border-[#c59b27]/35 shadow-2xl text-[#F5EFE5] select-none"
    >
      {modes.map(({ id, label, Icon, tip }) => {
        const isActive = viewMode === id;
        return (
          <button
            key={id}
            id={`top-mode-${id}`}
            onClick={() => onSetViewMode(id)}
            title={tip}
            className={`flex items-center gap-1 sm:gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-xs font-mono font-bold transition-all duration-200 cursor-pointer ${
              isActive
                ? 'bg-[#D9AE29] text-[#0c0e12] shadow-md ring-1 ring-[#D9AE29]'
                : 'text-[#F5EFE5]/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#0c0e12]' : 'text-[#D9AE29]'}`} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};

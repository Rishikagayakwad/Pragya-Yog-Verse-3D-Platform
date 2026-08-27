import React from 'react';
import { 
  SlidersHorizontal, 
  User, 
  Clock, 
  Activity, 
  Target, 
  Zap 
} from 'lucide-react';
import type { Asana } from '../../types';

interface TelemetryStatsBarProps {
  asana: Asana;
}

export const TelemetryStatsBar: React.FC<TelemetryStatsBarProps> = ({ asana }) => {
  return (
    <div 
      id="studio-telemetry-stats"
      className="w-full p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-[#FAF6F0]/90 dark:bg-[#071912]/90 backdrop-blur-xl border border-[#00381F]/15 dark:border-[#D9AE29]/25 shadow-md grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs text-[#272727] dark:text-[#F5EFE5]"
    >
      {/* 1. Level */}
      <div className="p-2.5 rounded-xl sm:rounded-2xl bg-white/70 dark:bg-[#002816]/70 border border-[#00381F]/10 dark:border-[#D9AE29]/20 space-y-1">
        <div className="text-[10px] font-mono text-[#944426] dark:text-[#D9AE29] flex items-center gap-1 font-semibold">
          <SlidersHorizontal className="w-3 h-3 text-[#944426] dark:text-[#D9AE29]" />
          Level
        </div>
        <div className="font-bold text-[#00381F] dark:text-[#F5EFE5] truncate">
          {asana.difficulty}
        </div>
      </div>

      {/* 2. Type */}
      <div className="p-2.5 rounded-xl sm:rounded-2xl bg-white/70 dark:bg-[#002816]/70 border border-[#00381F]/10 dark:border-[#D9AE29]/20 space-y-1">
        <div className="text-[10px] font-mono text-[#944426] dark:text-[#D9AE29] flex items-center gap-1 font-semibold">
          <User className="w-3 h-3 text-[#944426] dark:text-[#D9AE29]" />
          Type
        </div>
        <div className="font-bold text-[#00381F] dark:text-[#F5EFE5] truncate">
          {asana.category}
        </div>
      </div>

      {/* 3. Duration */}
      <div className="p-2.5 rounded-xl sm:rounded-2xl bg-white/70 dark:bg-[#002816]/70 border border-[#00381F]/10 dark:border-[#D9AE29]/20 space-y-1">
        <div className="text-[10px] font-mono text-[#944426] dark:text-[#D9AE29] flex items-center gap-1 font-semibold">
          <Clock className="w-3 h-3 text-[#944426] dark:text-[#D9AE29]" />
          Duration
        </div>
        <div className="font-bold text-[#00381F] dark:text-[#F5EFE5] truncate">
          30–60 sec
        </div>
      </div>

      {/* 4. Intensity */}
      <div className="p-2.5 rounded-xl sm:rounded-2xl bg-white/70 dark:bg-[#002816]/70 border border-[#00381F]/10 dark:border-[#D9AE29]/20 space-y-1">
        <div className="text-[10px] font-mono text-[#944426] dark:text-[#D9AE29] flex items-center gap-1 font-semibold">
          <Activity className="w-3 h-3 text-[#944426] dark:text-[#D9AE29]" />
          Intensity
        </div>
        <div className="font-bold text-[#00381F] dark:text-[#F5EFE5] truncate">
          {asana.difficulty === 'Hard' ? 'High' : asana.difficulty === 'Intermediate' ? 'Moderate' : 'Gentle'}
        </div>
      </div>

      {/* 5. Focus Area */}
      <div className="p-2.5 rounded-xl sm:rounded-2xl bg-white/70 dark:bg-[#002816]/70 border border-[#00381F]/10 dark:border-[#D9AE29]/20 space-y-1">
        <div className="text-[10px] font-mono text-[#944426] dark:text-[#D9AE29] flex items-center gap-1 font-semibold">
          <Target className="w-3 h-3 text-[#944426] dark:text-[#D9AE29]" />
          Focus Area
        </div>
        <div className="font-bold text-[#00381F] dark:text-[#F5EFE5] truncate">
          {asana.muscles?.[0]?.name ? `${asana.muscles[0].name}, Core` : 'Spine & Hips'}
        </div>
      </div>

      {/* 6. Energy */}
      <div className="p-2.5 rounded-xl sm:rounded-2xl bg-white/70 dark:bg-[#002816]/70 border border-[#00381F]/10 dark:border-[#D9AE29]/20 space-y-1">
        <div className="text-[10px] font-mono text-[#944426] dark:text-[#D9AE29] flex items-center gap-1 font-semibold">
          <Zap className="w-3 h-3 text-[#944426] dark:text-[#D9AE29]" />
          Energy
        </div>
        <div className="font-bold text-[#00381F] dark:text-[#F5EFE5] truncate">
          {asana.movementTypes?.[0] ? `Builds ${asana.movementTypes[0]}` : 'Energizing'}
        </div>
      </div>
    </div>
  );
};

